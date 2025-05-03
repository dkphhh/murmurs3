// TODO: 2.0 规划


// TODO: 迁移到 node ？看看用 bun 运行是否文档再说

// TODO：参照 bluesky、apple 原生 app 重置，注意设计移动端ui
// TODO：展示 murmurs 的内容下方加上 菜单（修改、threads、等等）按钮，鼠标放到对应murmurs后显示，点击后可以进行操作

// TODO: 增加类似 threads 的逻辑 
// TODO：增加 blog 板块，和murmurs 合到一起

// TODO: 用 Redis 做一个任务队列，将文件上传和处理，打标签任务放到后台执行，执行完毕后给前台通知
// TODO：参照下面的实现方法，建立一个全局通知系统
// TODO: 目前通知用户等待并在有结果以后刷新的功能做得还不够好，目前调用浏览器刷新的功能，有时候会启用浏览器缓存，要改进


// TODO：重新梳理color mode 的逻辑
// TODO：目前会有闪烁的情况出现
// TODO：在窄屏上，其他页面元素会被color mode button挡住

// TODO: 单独的标签页按钮

// TODO：增加运行日志功能

// TODO：在 writeArea  自动粘贴附件，并识别媒体类型
// TODO: 增加标签的增删功能

// TODO: 给所有的 <a></a>  加一个 hover 显示预览效果
// TODO: 自定义一个音频展示的样式，暂时的想法是做成一个圆角矩形的按钮，重点是原型的暂停/考试按钮，圆周用红色展示播放进度

// TODO：在图片或视频加载完成前，显示一个低质量的图像占位符或纯色块，可以改善用户感知性能
// TODO: 优化图片和视频的缓存策略

// TODO: 优化向服务器传输 build 目录的方式，scp 太慢了
// TODO: <code> 标签展示

// TODO：百度站长链接
// 
// ```Markdown
// 基于你提供的代码，我来设计一个解决方案，让你的通知系统能够跨页面工作，特别是在表单提交并重定向后也能显示相关的错误或成功消息。

// ## 解决方案：使用 Cookies 实现 Flash Messages

// ### 步骤1：创建一个 hooks.server.ts 文件处理 Flash Messages

// ```typescript
// import type { Handle } from '@sveltejs/kit';

// export const handle: Handle = async ({ event, resolve }) => {
//   // 为每个请求添加简单的 flash 通知系统
//   const getFlash = () => {
//     const flash = event.cookies.get('flash');
//     if (flash) {
//       event.cookies.delete('flash', { path: '/' });
//       try {
//         return JSON.parse(flash);
//       } catch {
//         return null;
//       }
//     }
//     return null;
//   };

//   const setFlash = (data: any) => {
//     event.cookies.set('flash', JSON.stringify(data), {
//       path: '/',
//       maxAge: 30, // 只保留30秒，避免通知持久化
//       httpOnly: false, // 允许 JavaScript 访问
//     });
//   };

//   // 将 flash 方法附加到 event.locals 上
//   event.locals.flash = { get: getFlash, set: setFlash };

//   return resolve(event);
// };
// ```

// ### 步骤2：创建 types 确保类型安全（可选但推荐）

// ```typescript
// // 扩展现有的 app.d.ts 文件或创建一个新文件

// declare global {
//   namespace App {
//     interface Locals {
//       flash: {
//         get: () => { error?: boolean; description?: string } | null;
//         set: (data: { error?: boolean; description?: string }) => void;
//       };
//     }
//     // 如果有其他类型定义，保留它们
//   }
// }

// export {};
// ```

// ### 步骤3：添加根布局服务器加载函数，获取 Flash Messages

// ```typescript
// import type { LayoutServerLoad } from './$types';

// export const load: LayoutServerLoad = async ({ locals }) => {
//   const flash = locals.flash.get();

//   return {
//     flash // 这会自动传递给前端的 +layout.svelte
//   };
// };
// ```

// ### 步骤4：修改根布局组件，处理 Flash Messages

// ```svelte
// <script lang="ts">
//   import "../app.css";
//   import DarkModeButton from "$lib/components/ColorModeButton.svelte";
//   import Notification from "$lib/components/Notification.svelte";
//   import { formNotification } from "$lib/components/notification.svelte.ts";

//   let { data, children } = $props();

//   // 当从服务器获取到 flash 消息时，更新全局 formNotification
//   $effect(() => {
//     if (data.flash?.error) {
//       formNotification.error = true;
//       formNotification.description = data.flash.description;
//     }
//   });
// </script>

// <DarkModeButton />

// <Notification />

// <div
//   class="
//       flex flex-col justify-start items-center
//       min-h-screen w-full px-2 py-4
//       font-light font-sans
//       tracking-wider text-justify
//       text-slate-900
//       dark:bg-slate-950
//       dark:text-slate-100
//       "
// >
//   {@render children()}

//   <hr class="w-full border-slate-300 dark:border-slate-700 mt-2" />
//   <footer class="flex justify-center items-center mt-4 w-full">
//     <img
//       class="mb-2 w-25"
//       alt="Written By Human Not By AI"
//       src="/Written-By-Human-Not-By-AI-Badge-white.svg"
//     />
//   </footer>
// </div>
// ```

// ### 步骤5：修改你的 action 处理函数，使用 Flash Messages

// 示例（在任何 `+page.server.ts` 文件中）：

// ```typescript
// export const actions = {
//   create: async ({ request, locals }) => {
//     try {
//       // ... 你现有的代码 ...

//       // 成功时也可以设置 flash 消息
//       locals.flash.set({ error: false, description: "文章创建成功！" });
//       // 然后重定向
//       redirect(303, '/'); // 或其他目标页面

//     } catch (error) {
//       console.log(error);

//       // 设置 flash 消息以便在重定向后显示
//       locals.flash.set({ 
//         error: true, 
//         description: error instanceof Error ? error.message : "发生未知错误" 
//       });

//       // 你可以选择重定向到其他页面
//       redirect(303, '/write'); // 或留在当前页面，通过 fail() 返回

//       // 或者如果要留在当前页面且返回表单数据:
//       // return fail(422, {
//       //   error: true,
//       //   description: (error as Error).message,
//       // });
//     }
//   },

//   // 其他 actions...
// };
// ```

// ## 工作原理：

// 1. 当用户提交表单时，如果发生错误，我们将错误信息存储在 cookie 中。
// 2. 然后 action 可以选择重定向到任何页面，错误信息会随着 cookie 一起传递。
// 3. 在新页面加载时，`+layout.server.ts` 的 `load` 函数读取并清除这个 cookie。
// 4. 从 cookie 中获取的错误信息被传递给 +layout.svelte。
// 5. +layout.svelte 中的 `$effect` 监听这个数据，并更新你已有的全局 `formNotification` 状态。
// 6. 你的 `Notification` 组件会响应这个状态变化，显示错误消息。

// 这样，无论用户被重定向到哪个页面，通知都会正确显示，并且在显示一次后自动清除。

// ## 优势：

// 1. **完全解耦**：通知系统与特定页面/组件解耦
// 2. **一次性**：消息只显示一次，避免重复
// 3. **灵活**：可以从任何 action 发送通知到任何页面
// 4. **类型安全**：如果使用 TypeScript，可以获得完整的类型支持

// 这种方案保留了你现有的通知组件和状态管理逻辑，只添加了一个持久化层来处理跨页面/跨请求的通知传递。

