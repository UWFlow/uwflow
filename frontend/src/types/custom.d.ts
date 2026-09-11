/* Custom types missing from packages */
declare module 'styled-components-breakpoint';
declare module 'react-facebook-login/dist/facebook-login-render-props';

/* Media extensions */
declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module '*.webm' {
  const src: string;
  export default src;
}

declare module 'worker-loader!*' {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}
