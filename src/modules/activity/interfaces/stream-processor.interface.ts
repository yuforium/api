export interface StreamProcessor {
  // function to process an incoming stream
  consume(stream: any): Promise<any>;

  // function to process an outgoing stream
  dispatch(stream: any): Promise<any>;
}