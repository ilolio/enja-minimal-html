import {
  pipeline,
  TextStreamer,
  StoppingCriteria,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@next";

const MODEL_ID = "onnx-community/LFM2-350M-ENJP-MT-ONNX";

let generator = null;
let currentAbortCriteria = null;

class AbortStoppingCriteria extends StoppingCriteria {
  constructor() {
    super();
    this.abort = false;
  }

  _call(input_ids, scores) {
    return new Array(input_ids.length).fill(this.abort);
  }
}

class CallbackTextStreamer extends TextStreamer {
  constructor(tokenizer, opts = {}) {
    super(tokenizer, { skip_prompt: true, skip_special_tokens: true, ...opts });
    this.chunks = [];
  }

  on_finalized_text(text) {
    this.chunks.push(text);
    self.postMessage({ type: "stream", text });
  }
}

async function loadModel(data) {
  const device = data.device || "wasm";
  const dtype = data.dtype || "q4";

  self.postMessage({ type: "status", message: "モデルを読み込み中..." });

  generator = await pipeline("text-generation", MODEL_ID, {
    dtype,
    device,
    progress_callback: (progress) => {
      self.postMessage({ type: "progress", ...progress });
    },
  });

  self.postMessage({ type: "status", message: "モデル読み込み完了" });
  self.postMessage({ type: "ready" });
}

async function translate(data) {
  if (!generator) {
    self.postMessage({ type: "error", message: "モデルが読み込まれていません" });
    return;
  }

  const systemPrompt =
    data.direction === "en2ja" ? "Translate to Japanese." : "Translate to English.";

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: data.text },
  ];

  self.postMessage({ type: "translate_start" });

  const streamer = new CallbackTextStreamer(generator.tokenizer);
  const abortCriteria = new AbortStoppingCriteria();
  currentAbortCriteria = abortCriteria;

  try {
    await generator(messages, {
      max_new_tokens: 1024,
      do_sample: false,
      streamer,
      stopping_criteria: [abortCriteria],
    });

    const result = streamer.chunks.join("");
    self.postMessage({ type: "translate_end", text: result, aborted: abortCriteria.abort });
  } catch (e) {
    self.postMessage({ type: "error", message: e.message });
  } finally {
    currentAbortCriteria = null;
  }
}

self.addEventListener("message", async (e) => {
  const { type, ...data } = e.data;
  switch (type) {
    case "load":
      await loadModel(data);
      break;
    case "translate":
      await translate(data);
      break;
    case "abort":
      if (currentAbortCriteria) currentAbortCriteria.abort = true;
      break;
  }
});
