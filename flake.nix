{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {
        inherit system;
      };
    in {
      devShells.default = with pkgs;
        mkShell {
          packages = [
            nodejs
            pnpm
            cacert
          ];
          shellHook = ''
            export PATH="$PWD/node_modules/.bin/:$PATH"
            # fixes ssl errors within the worker runtime
            export SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
          '';
        };
    });
}
