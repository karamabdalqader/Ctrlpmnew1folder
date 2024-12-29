{ pkgs }: {
    deps = [
        pkgs.nodejs-18_x
        pkgs.nodePackages.typescript-language-server
        pkgs.nodePackages.npm
        pkgs.nodePackages.yarn
        pkgs.replitPackages.jest
        pkgs.nodePackages.vscode-langservers-extracted
        pkgs.nodePackages.typescript
    ];
    env = {
        LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
            pkgs.libuuid
        ];
    };
}
