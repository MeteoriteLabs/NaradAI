(function() {
  const currentScript = document.currentScript as HTMLScriptElement;
  
  if (!currentScript) {
    console.error('[Narada AI] Could not find script tag');
    return;
  }

  const agentId = currentScript.getAttribute('data-agent-id');
  const apiBase = currentScript.getAttribute('data-api-base');
  
  if (!agentId) {
    console.error('[Narada AI] Missing data-agent-id attribute');
    return;
  }

  const scriptSrc = currentScript.src;
  const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
  
  const widgetUrl = `${baseUrl}/widget.js`;
  
  function initWidget() {
    const widgetHost = document.createElement('div');
    widgetHost.id = 'narada-widget-host';
    document.body.appendChild(widgetHost);

    const shadowRoot = widgetHost.attachShadow({ mode: 'open' });
    
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'narada-widget-root';
    shadowRoot.appendChild(widgetContainer);

    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = `${baseUrl}/widget.css`;
    shadowRoot.appendChild(styleLink);

    let websocketUrl;
    if (apiBase) {
      const apiUrl = new URL(apiBase);
      websocketUrl = `${apiUrl.protocol === 'https:' ? 'wss:' : 'ws:'}//${apiUrl.host}/ws`;
    } else {
      websocketUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
    }

    if ((window as any).NaradaWidget) {
      (window as any).NaradaWidget.mount(widgetContainer, {
        agentId,
        websocketUrl,
      });

      trackPageView();
      setupEventTracking();
    }
  }

  function trackPageView() {
    const eventData = {
      type: 'page_view',
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
    };
    
    console.log('[Narada AI] Page view:', eventData);
  }

  function setupEventTracking() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const tag = element.getAttribute('data-event-tag');
            
            if (tag) {
              console.log('[Narada AI] Element visible:', tag);
            }
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    document.querySelectorAll('[data-event-tag]').forEach((el) => {
      observer.observe(el);
    });

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const tag = target.getAttribute('data-event-tag');
      
      if (tag) {
        console.log('[Narada AI] Element clicked:', tag);
      }
    });
  }

  const script = document.createElement('script');
  script.src = widgetUrl;
  script.async = true;
  script.onload = initWidget;
  script.onerror = () => {
    console.error('[Narada AI] Failed to load widget bundle');
  };
  
  document.head.appendChild(script);
})();
