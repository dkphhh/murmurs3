<script lang="ts">
  import { enhance } from "$app/forms";
  import { authClient } from "$lib/auth/auth-client.js";
  import { clientSignIn, clientSignUp } from "$lib/auth/utils";
  import { formNotification } from "../../components/notification.svelte.ts";
  import { goto } from "$app/navigation";

  const session = authClient.useSession();

  let { form } = $props();

  let email = $state("");

  let password = $state("");

  $effect(() => {
    if (form?.error) {
      formNotification.error = form.error;
      formNotification.description = form.description;
    }
  });
</script>

<div class="flex flex-col justify-center items-center h-[80vh]">
  <!-- 用户未登录，显示邮箱输入框，检查邮箱是否已经注册 -->
  {#if !form && !$session.data?.user}
    <form
      class="flex flex-col gap-4 items-center my-4"
      action="?/checkUserExist"
      method="post"
      use:enhance={() => {
        return async ({ update }) => {
          await update({ reset: false });
        };
      }}
    >
      <label for="email">
        Email: <input
          id="email"
          required={true}
          type="text"
          name="email"
          placeholder="Email"
          bind:value={email}
        />
      </label>

      <button
        type="submit"
        class="px-4 py-2 w-fit
                    bg-slate-900 hover:bg-slate-700
                    dark:bg-slate-100 dark:hover:bg-slate-300
                    text-slate-100 dark:text-slate-900
                    disabled:bg-gray-500
                    font-medium
                    rounded-lg shadow-md">Sign In</button
      >
    </form>
    <p class="text-xs">请输入邮箱，如果邮箱不存在，将自动注册</p>
    <!-- 如果用户存在，显示密码输入框，引导登录 -->
  {:else if form?.userExist === true && !$session.data?.user}
    <p>用户 {email} 已存在，请输入密码登录</p>
    <form
      class="flex flex-col gap-4 items-center my-4"
      method="dialog"
      use:enhance
      onsubmit={async (e: Event) => {
        e.preventDefault();
        const res = await clientSignIn(email, password);
        console.log(res);
      }}
    >
      <div class="flex flex-col gap-2 items-end">
        <label for="email" class="">
          Email: <input
            id="email"
            required={true}
            type="text"
            name="email"
            placeholder="Email"
            bind:value={email}
            disabled={true}
          /></label
        >

        <label for="password">
          Password: <input
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            bind:value={password}
          /></label
        >
      </div>

      <button
        type="submit"
        class="px-4 py-2 w-fit
                    bg-slate-900 hover:bg-slate-700
                    dark:bg-slate-100 dark:hover:bg-slate-300
                    text-slate-100 dark:text-slate-900
                    disabled:bg-gray-500
                    font-medium
                    rounded-lg shadow-md">Sign In</button
      >
    </form>
    <!-- 如果用户不存在，显示密码输入框，引导注册 -->
  {:else if form?.userExist === false && !$session.data?.user}
    <p>用户 {email} 不存在，请输入密码注册</p>
    <form
      class="flex flex-col gap-4 items-center my-4"
      method="dialog"
      use:enhance
      onsubmit={async (e: Event) => {
        e.preventDefault();
        const res = await clientSignUp(email, password);
        console.log(res);
      }}
    >
      <div class="flex flex-col items-end gap-2">
        <label for="email">
          Email: <input
            id="email"
            required={true}
            type="text"
            name="email"
            placeholder="Email"
            bind:value={email}
            disabled={true}
          /></label
        >

        <label for="password">
          Password: <input
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            bind:value={password}
          /></label
        >
      </div>

      <button
        type="submit"
        class="px-4 py-2 w-fit
                    bg-slate-900 hover:bg-slate-700
                    dark:bg-slate-100 dark:hover:bg-slate-300
                    text-slate-100 dark:text-slate-900
                    disabled:bg-gray-500
                    font-medium
                    rounded-lg shadow-md">Sign Up</button
      >
    </form>
    <!-- 用户成功登录 -->
  {:else if $session.data?.user}
    <div class="flex flex-col items-center gap-4 my-4">
      <p>Welcome, {$session.data.user.email}</p>
      <button
        type="button"
        class="px-4 py-2 w-fit
                    bg-slate-900 hover:bg-slate-700
                    dark:bg-slate-100 dark:hover:bg-slate-300
                    text-slate-100 dark:text-slate-900
                    disabled:bg-gray-500
                    font-medium
                    rounded-lg shadow-md"
        onclick={async (e: Event) => {
          e.preventDefault();
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                goto("/auth"); // redirect to login page
              },
            },
          });
        }}>Sign Out</button
      >
    </div>
  {/if}
</div>
