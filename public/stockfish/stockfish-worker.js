/* eslint-disable no-undef */
self.Module = {
  locateFile(path) {
    if (path.endsWith(".wasm")) {
      return "/stockfish/stockfish-nnue-16-single.wasm";
    }
    return `/stockfish/${path}`;
  },
};

importScripts("/stockfish/stockfish-nnue-16-single.js");
