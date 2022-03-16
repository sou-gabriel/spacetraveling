import { useEffect } from 'react';

const attributes = {
  src: 'https://utteranc.es/client.js',
  repo: 'sou-gabriel/spacetraveling',
  'issue-term': 'pathname',
  theme: 'github-dark-orange',
  crossorigin: 'anonymous',
  async: true,
};

export const Comments = (): JSX.Element => {
  useEffect(() => {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');

    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, String(value));
    });

    anchor.appendChild(script);
  }, []);

  return <div id="inject-comments-for-uterances" />;
};
