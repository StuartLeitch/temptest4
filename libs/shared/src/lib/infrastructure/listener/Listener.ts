export interface ListenerContract {
  startListening<T>(
    queName: string,
    callback: (data: T) => void
  ): Promise<void>;
}
