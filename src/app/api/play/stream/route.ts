import { getPlayState } from "@/lib/play/state";
import { subscribePlayStream } from "@/lib/play/stream";

export async function GET(request: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      let lastPayload = "";

      const send = (data: unknown) => {
        const payload = JSON.stringify(data);
        if (payload === lastPayload) {
          return;
        }
        lastPayload = payload;
        controller.enqueue(`data: ${payload}\n\n`);
      };

      const emitState = async () => {
        const state = await getPlayState();
        send(state);
      };

      await emitState();

      const unsubscribe = subscribePlayStream(() => {
        emitState().catch(() => {
          // Ignore emit errors.
        });
      });

      const keepAlive = setInterval(() => {
        controller.enqueue(`event: ping\ndata: {}\n\n`);
      }, 15000);

      const close = () => {
        clearInterval(keepAlive);
        unsubscribe();
        controller.close();
      };

      request.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
