{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    crane.url = "github:ipetkov/crane";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    nixpkgs,
    flake-utils,
    crane,
    rust-overlay,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {
        inherit system;
        overlays = [(import rust-overlay)];
      };
      # worker-build --panic-unwind rebuilds std, which needs nightly with rust-src
      toolchain = pkgs.rust-bin.selectLatestNightlyWith (t:
        t.default.override {
          targets = ["wasm32-unknown-unknown"];
          extensions = ["rust-src" "rust-analyzer"];
        });
      craneLib = (crane.mkLib pkgs).overrideToolchain toolchain;
      commonArgs = {
        src = craneLib.cleanCargoSource ./.;
        strictDeps = true;
        CARGO_BUILD_TARGET = "wasm32-unknown-unknown";
        # tests can't run on the wasm target
        doCheck = false;
      };
      cargoArtifacts = craneLib.buildDepsOnly commonArgs;

      # worker-build runs `cargo +nightly`, `rustc +nightly` and asks rustup whether rust-src
      # is installed, so point all of that at the nix toolchain instead of rustup.
      # its kinda gay but here we are
      nightlyShims = pkgs.symlinkJoin {
        name = "nightly-shims";
        paths =
          map (tool:
            pkgs.writeShellScriptBin tool ''
              [ "$1" = +nightly ] && shift
              exec ${toolchain}/bin/${tool} "$@"
            '') ["cargo" "rustc"]
          ++ [(pkgs.writeShellScriptBin "rustup" "echo 'rust-src (installed)'")];
      };
    in {
      packages.default = craneLib.buildPackage (commonArgs // {inherit cargoArtifacts;});

      checks.clippy = craneLib.cargoClippy (commonArgs
        // {
          inherit cargoArtifacts;
          cargoClippyExtraArgs = "-- --deny warnings";
        });

      devShells.default = craneLib.devShell {
        packages = with pkgs; [
          worker-build
          wrangler
          wasm-bindgen-cli
          binaryen
          cacert
        ];
        # stop worker-build downloading its own binaries
        WASM_BINDGEN_BIN = "${pkgs.wasm-bindgen-cli}/bin/wasm-bindgen";
        WASM_OPT_BIN = "${pkgs.binaryen}/bin/wasm-opt";
        shellHook = ''
          export PATH="${nightlyShims}/bin:$PATH"
          # fixes ssl errors within the worker runtime
          export SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
        '';
      };
    });
}
