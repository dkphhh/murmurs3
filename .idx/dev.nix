{pkgs}: {
  channel = "unstable";
  packages = [
    pkgs.bun
  ];
  idx.extensions = [
    "svelte.svelte-vscode"
    "bradlc.vscode-tailwindcss"
    "dbaeumer.vscode-eslint"
    "william-voyek.vscode-nginx"
    "esbenp.prettier-vscode"
    "formulahendry.auto-close-tag"
    "formulahendry.auto-rename-tag"
    "oven.bun-vscode"
    "emranweb.daisyui-snippet"
    "Gruntfuggly.todo-tree"
    "uctakeoff.vscode-counter"

  ];
  idx.previews = {
    previews = {
      web = {
        command = [
          "bun"
          "run"
          "dev"
           "--"
          "--port"
          "$PORT"
          "--host"
          "0.0.0.0"
        ];
        manager = "web";
      };
    };
  };
}