interface PageTextContext {
  title: string;
  url: string;
  headings: string[];
  paragraphs: string[];
  mainContent: string;
}

interface PageStructureContext {
  buttons: { text: string; id?: string; class?: string }[];
  links: { text: string; href: string }[];
  forms: { id?: string; fields: string[] }[];
  inputs: { type: string; placeholder?: string; label?: string }[];
  navigation: string[];
}

interface ScreenshotContext {
  dataUrl: string;
  width: number;
  height: number;
}

export interface PageContext {
  url: string;
  title: string;
  userAgent: string;
  timestamp: string;
  text?: PageTextContext;
  structure?: PageStructureContext;
  screenshot?: ScreenshotContext;
}

export interface CaptureOptions {
  captureText?: boolean;
  captureStructure?: boolean;
  captureScreenshot?: boolean;
}

function getVisibleText(element: Element): string {
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return '';
  }
  return element.textContent?.trim() || '';
}

function truncateText(text: string, maxLength: number = 500): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function capturePageText(): PageTextContext {
  const headings: string[] = [];
  const paragraphs: string[] = [];
  
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el) => {
    const text = getVisibleText(el);
    if (text && text.length > 0) {
      headings.push(truncateText(text, 200));
    }
  });
  
  document.querySelectorAll('p').forEach((el) => {
    const text = getVisibleText(el);
    if (text && text.length > 10) {
      paragraphs.push(truncateText(text, 300));
    }
  });
  
  const mainElement = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
  const mainContent = truncateText(getVisibleText(mainElement), 2000);
  
  return {
    title: document.title,
    url: window.location.href,
    headings: headings.slice(0, 20),
    paragraphs: paragraphs.slice(0, 15),
    mainContent,
  };
}

export function capturePageStructure(): PageStructureContext {
  const buttons: { text: string; id?: string; class?: string }[] = [];
  const links: { text: string; href: string }[] = [];
  const forms: { id?: string; fields: string[] }[] = [];
  const inputs: { type: string; placeholder?: string; label?: string }[] = [];
  const navigation: string[] = [];
  
  document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]').forEach((el) => {
    const text = getVisibleText(el) || (el as HTMLInputElement).value || '';
    if (text) {
      buttons.push({
        text: truncateText(text, 100),
        id: el.id || undefined,
        class: el.className ? truncateText(el.className, 100) : undefined,
      });
    }
  });
  
  document.querySelectorAll('a[href]').forEach((el) => {
    const anchor = el as HTMLAnchorElement;
    const text = getVisibleText(el);
    if (text && anchor.href) {
      links.push({
        text: truncateText(text, 100),
        href: anchor.href,
      });
    }
  });
  
  document.querySelectorAll('form').forEach((formEl) => {
    const form = formEl as HTMLFormElement;
    const fields: string[] = [];
    
    form.querySelectorAll('input, select, textarea').forEach((inputEl) => {
      const input = inputEl as HTMLInputElement;
      const label = form.querySelector(`label[for="${input.id}"]`)?.textContent?.trim();
      fields.push(label || input.placeholder || input.name || input.type);
    });
    
    forms.push({
      id: form.id || undefined,
      fields: fields.slice(0, 10),
    });
  });
  
  document.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach((el) => {
    const input = el as HTMLInputElement;
    const labelEl = document.querySelector(`label[for="${input.id}"]`);
    
    inputs.push({
      type: input.type || 'text',
      placeholder: input.placeholder || undefined,
      label: labelEl?.textContent?.trim() || undefined,
    });
  });
  
  document.querySelectorAll('nav a, [role="navigation"] a').forEach((el) => {
    const text = getVisibleText(el);
    if (text) {
      navigation.push(truncateText(text, 50));
    }
  });
  
  return {
    buttons: buttons.slice(0, 30),
    links: links.slice(0, 50),
    forms: forms.slice(0, 5),
    inputs: inputs.slice(0, 20),
    navigation: navigation.slice(0, 20),
  };
}

export async function captureScreenshot(): Promise<ScreenshotContext | null> {
  try {
    if (typeof html2canvas !== 'undefined') {
      const canvas = await (window as any).html2canvas(document.body, {
        scale: 0.5,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: Math.min(window.innerWidth, 1200),
        height: Math.min(window.innerHeight, 800),
      });
      
      return {
        dataUrl: canvas.toDataURL('image/jpeg', 0.6),
        width: canvas.width,
        height: canvas.height,
      };
    }
    
    console.log('[Narada] html2canvas not available, skipping screenshot');
    return null;
  } catch (error) {
    console.error('[Narada] Screenshot capture failed:', error);
    return null;
  }
}

export async function captureFullPageContext(options: CaptureOptions): Promise<PageContext> {
  const context: PageContext = {
    url: window.location.href,
    title: document.title,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };
  
  if (options.captureText) {
    context.text = capturePageText();
  }
  
  if (options.captureStructure) {
    context.structure = capturePageStructure();
  }
  
  if (options.captureScreenshot) {
    const screenshot = await captureScreenshot();
    if (screenshot) {
      context.screenshot = screenshot;
    }
  }
  
  return context;
}

export function formatContextForAI(context: PageContext): string {
  let formatted = `\n\n=== CURRENT PAGE CONTEXT ===\n`;
  formatted += `URL: ${context.url}\n`;
  formatted += `Title: ${context.title}\n`;
  
  if (context.text) {
    formatted += `\n--- Page Content ---\n`;
    if (context.text.headings.length > 0) {
      formatted += `Headings: ${context.text.headings.join(' | ')}\n`;
    }
    if (context.text.mainContent) {
      formatted += `Main Content Summary: ${context.text.mainContent.substring(0, 1000)}\n`;
    }
  }
  
  if (context.structure) {
    formatted += `\n--- Interactive Elements ---\n`;
    if (context.structure.buttons.length > 0) {
      formatted += `Buttons: ${context.structure.buttons.map(b => b.text).join(', ')}\n`;
    }
    if (context.structure.navigation.length > 0) {
      formatted += `Navigation: ${context.structure.navigation.join(', ')}\n`;
    }
    if (context.structure.forms.length > 0) {
      formatted += `Forms: ${context.structure.forms.length} form(s) with fields: ${context.structure.forms.map(f => f.fields.join(', ')).join(' | ')}\n`;
    }
    if (context.structure.inputs.length > 0) {
      formatted += `Input fields: ${context.structure.inputs.map(i => i.label || i.placeholder || i.type).join(', ')}\n`;
    }
  }
  
  formatted += `=== END PAGE CONTEXT ===\n`;
  
  return formatted;
}
