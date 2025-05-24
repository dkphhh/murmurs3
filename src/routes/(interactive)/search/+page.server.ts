import { redirect, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";



export const actions: Actions = {
    search: async ({ request, locals }) => {
        const formData = await request.formData();
        const query = formData.get("query") as string;
        if (!query) {
            locals.notification.set({
                type: "error",
                description: "查询内容不能为空",
            });

            return fail(422, {
                error: true,
                description: "查询内容不能为空",
            });
        }
        redirect(307, `/search/result?query=${encodeURIComponent(query)}&page_num=1`);
    }
}  