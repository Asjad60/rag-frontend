(function () {
  if (window.__RAG_WIDGET_LOADED__) return;
  window.__RAG_WIDGET_LOADED__ = true;

  const currentScript =
    document.currentScript ||
    document.querySelector('script[data-bot-id]') ||
    Array.from(document.querySelectorAll('script')).find(s => s.src && s.src.includes('widget-loader.js'));

  if (!currentScript) {
    console.error('RAG Widget Loader: Could not locate script tag with data-bot-id.');
    return;
  }

  const botId = currentScript.getAttribute('data-bot-id');
  if (!botId) {
    console.error('RAG Widget Loader: "data-bot-id" attribute is required.');
    return;
  }

  let frontendOrigin = 'http://localhost:5173';
  try {
    if (currentScript.src) {
      const url = new URL(currentScript.src);
      frontendOrigin = url.origin;
    }
  } catch (_) {
    console.warn('RAG Widget Loader: Using fallback origin', frontendOrigin);
  }

  const iframeId = 'rag-widget-iframe-' + botId;
  if (document.getElementById(iframeId)) return;

  const iframe = document.createElement('iframe');
  iframe.id = iframeId;
  iframe.src = `${frontendOrigin}/widget-embed?botId=${encodeURIComponent(botId)}`;
  iframe.title = 'RAG AI Assistant Widget';
  iframe.setAttribute('allow', 'clipboard-write');

  const collapsedStyles = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '75px',
    height: '75px',
    border: 'none',
    borderRadius: '0px',
    zIndex: '999999',
    background: 'transparent',
    boxShadow: 'none',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    overflow: 'visible'
  };

  const expandedStyles = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '410px',
    height: '640px',
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100vh - 32px)',
    border: 'none',
    borderRadius: '24px',
    zIndex: '999999',
    background: 'transparent',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    overflow: 'hidden'
  };

  function applyStyles(el, styles) {
    Object.assign(el.style, styles);
  }

  applyStyles(iframe, collapsedStyles);

  const mountIframe = () => {
    if (!document.getElementById(iframeId)) {
      document.body.appendChild(iframe);
    }
  };

  if (document.body) {
    mountIframe();
  } else {
    document.addEventListener('DOMContentLoaded', mountIframe);
  }

  window.addEventListener('message', function (event) {
    const data = event.data;
    if (data && data.type === 'RAG_WIDGET_STATE') {
      if (data.isOpen) {
        applyStyles(iframe, expandedStyles);
      } else {
        applyStyles(iframe, collapsedStyles);
      }
    }
  });
})();
