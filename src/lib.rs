use std::time::Duration;

use base64::prelude::*;
use serde_json::json;
use subtle::ConstantTimeEq;
use worker::*;

#[event(fetch)]
async fn fetch(mut req: Request, env: Env, ctx: Context) -> Result<Response> {
    let path = req.path();
    let name = path.trim_start_matches('/');
    match (req.method(), name) {
        (Method::Get, "") => Response::redirect("https://danielraybone.com".parse()?),
        (Method::Post, "api/upload") => upload(&mut req, &env, &ctx).await,
        (Method::Get, name) if !name.contains('/') => get_image(&req, name, &env, &ctx).await,
        _ => Response::error("Not Found", 404),
    }
}

fn var(env: &Env, name: &str) -> Result<String> {
    Ok(env.var(name)?.to_string())
}

async fn get_image(req: &Request, name: &str, env: &Env, ctx: &Context) -> Result<Response> {
    let cache = Cache::default();
    if let Some(hit) = cache.get(req, false).await? {
        return Ok(hit);
    }

    let bucket = env.bucket("BUCKET")?;
    let b2_url = format!(
        "{}/{}/{}/{}",
        var(env, "B2_URL")?,
        var(env, "B2_BUCKET")?,
        var(env, "PATH_PREFIX")?,
        name
    );
    let start = Date::now().as_millis();
    let mut checked_b2 = false;
    let mut found = None;

    // file may still be uploading, wait until 9.5s timeout before erroring
    while Date::now().as_millis() - start < 9500 {
        if let Some(obj) = bucket.get(name).execute().await? {
            found = Some(r2_response(obj)?);
            break;
        }
        // no new uploads are sent to b2, if not found on first request dont retry
        if !checked_b2 {
            checked_b2 = true;
            if let Some(res) = fetch_b2(b2_url.parse()?).await {
                found = Some(res);
                break;
            }
        }
        Delay::from(Duration::from_millis(500)).await;
    }
    let Some(mut res) = found else {
        return Response::error("no image found", 404);
    };

    res.headers_mut().set("cache-control", "public, max-age=86400")?;
    let copy = res.cloned()?;
    let key = req.url()?.to_string();
    ctx.wait_until(async move {
        if let Err(e) = cache.put(key, copy).await {
            console_error!("cache put failed: {e}");
        }
    });
    Ok(res)
}

fn r2_response(obj: Object) -> Result<Response> {
    let content_type = obj.http_metadata().content_type;
    let body = obj.body().ok_or("r2 object has no body")?.response_body()?;
    let mut res = Response::from_body(body)?;
    res.headers_mut()
        .set("content-type", content_type.as_deref().unwrap_or("application/octet-stream"))?;
    Ok(res)
}

async fn fetch_b2(url: Url) -> Option<Response> {
    match Fetch::Url(url).send().await {
        Ok(res) if res.status_code() == 200 => {
            let headers = res
                .headers()
                .into_iter()
                .filter(|(k, _)| !k.starts_with("x-bz"))
                .collect();
            Some(res.with_headers(headers))
        }
        Ok(res) if res.status_code() == 404 => None,
        Ok(mut res) => {
            console_error!(
                "fetching image failed with non 404: {} {}",
                res.status_code(),
                res.text().await.unwrap_or_default()
            );
            None
        }
        Err(e) => {
            console_error!("fetching image failed: {e}");
            None
        }
    }
}

async fn upload(req: &mut Request, env: &Env, ctx: &Context) -> Result<Response> {
    let expected = format!(
        "Basic {}",
        BASE64_STANDARD.encode(format!("{}:{}", var(env, "AUTH_USER")?, var(env, "AUTH_PASS")?))
    );
    let auth_header = req.headers().get("authorization")?.unwrap_or_default();
    if !bool::from(auth_header.as_bytes().ct_eq(expected.as_bytes())) {
        let headers = Headers::from_iter([("www-authenticate", "Basic realm=\"Secure Area\"")]);
        return Ok(Response::error("Unauthorized", 401)?.with_headers(headers));
    }

    let Some(FormEntry::File(file)) = req.form_data().await?.get("file") else {
        return Ok(Response::from_json(&json!({ "message": "no file uploaded" }))?.with_status(400));
    };
    let url = req.url()?;
    let link = format!("{}://{}/{}", url.scheme(), url.host_str().unwrap_or_default(), file.name());

    let bucket = env.bucket("BUCKET")?;
    let bytes = file.bytes().await?;
    let job = async move {
        let metadata = HttpMetadata {
            content_type: Some(file.type_()),
            ..Default::default()
        };
        if let Err(e) = bucket.put(file.name(), bytes).http_metadata(metadata).execute().await {
            console_error!("upload failed: {e}");
        }
    };
    // by default the link is returned before the upload finishes so it can be posted sooner
    if url.query_pairs().any(|(k, v)| k == "wait" && v == "true") {
        job.await;
    } else {
        ctx.wait_until(job);
    }

    Response::from_json(&json!({ "link": link }))
}
