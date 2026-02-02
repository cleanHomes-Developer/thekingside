type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribePlayStream(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function publishPlayStream() {
  listeners.forEach((listener) => listener());
}
