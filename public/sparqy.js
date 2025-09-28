(function () {
  'use strict';

  // Simple URL joiner to respect optional basePath
  function joinUrl(basePath, path) {
    if (!basePath) return path;
    const a = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
    const b = path.startsWith('/') ? path : '/' + path;
    return a + b;
  }

  function createEl(tag, props) {
    const el = document.createElement(tag);
    if (props) {
      if (props.attrs) {
        Object.entries(props.attrs).forEach(([k, v]) => {
          if (v !== undefined && v !== null) el.setAttribute(k, String(v));
        });
      }
      if (props.text) el.textContent = props.text;
      if (props.html) el.innerHTML = props.html;
      if (props.style) Object.assign(el.style, props.style);
    }
    return el;
  }

  // Resolve API URL with multiple candidates to support different base paths
  function resolveCandidates(basePath, rawPath) {
    var clean = String(rawPath || '');
    clean = clean.startsWith('/') ? clean : '/' + clean;
    var out = [];
    // 1) basePath join
    out.push(joinUrl(basePath, clean));
    // 2) If __withBase__ exists, try it
    try {
      if (typeof window !== 'undefined' && typeof window.__withBase__ === 'function') {
        var noSlash = clean.replace(/^\//, '');
        var withBase = window.__withBase__(noSlash);
        if (withBase) out.push(withBase);
      }
    } catch (_) {}
    // 3) If current path sits under /portal, also try prefixed
    try {
      if (typeof window !== 'undefined') {
        var locPath = String(window.location && window.location.pathname || '');
        if (locPath.startsWith('/portal') && !clean.startsWith('/portal/')) {
          out.push('/portal' + clean);
        }
      }
    } catch (_) {}
    // Deduplicate
    var seen = Object.create(null);
    var uniq = [];
    for (var i=0; i<out.length; i++) {
      var u = out[i];
      if (!seen[u]) { seen[u] = true; uniq.push(u); }
    }
    return uniq;
  }

  function msgBubble(text, role) {
    const wrap = createEl('div', {
      style: {
        display: 'flex',
        justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
        margin: '6px 0'
      }
    });
    const bubble = createEl('div', {
      text,
      style: {
        maxWidth: '80%',
        padding: '8px 10px',
        borderRadius: '10px',
        background: role === 'user' ? '#2563eb' : '#f3f4f6',
        color: role === 'user' ? '#ffffff' : '#111827',
        fontSize: '14px',
        lineHeight: '1.4',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }
    });
    wrap.appendChild(bubble);
    return wrap;
  }

  function typingBubble() {
    const wrap = createEl('div', {
      style: { display: 'flex', justifyContent: 'flex-start', margin: '6px 0' }
    });
    const bubble = createEl('div', {
      text: 'Typing…',
      style: {
        padding: '8px 10px',
        borderRadius: '10px',
        background: '#f3f4f6',
        color: '#6b7280',
        fontSize: '13px'
      }
    });
    wrap.appendChild(bubble);
    return wrap;
  }

  function sourcesBlock(sources) {
    const block = createEl('div', { style: { marginTop: '4px' } });
    const title = createEl('div', { text: 'Sources:', style: { fontSize: '12px', color: '#6b7280', marginBottom: '2px' } });
    block.appendChild(title);
    const list = createEl('ul', { style: { paddingLeft: '16px', margin: 0 } });
    (sources || []).forEach(function (s) {
      const li = createEl('li', { style: { margin: '2px 0' } });
      const a = createEl('a', {
        text: s.title || s.displayLink || s.link || 'Link',
        attrs: { href: s.link || '#', target: '_blank', rel: 'noopener noreferrer' },
        style: { color: '#2563eb', textDecoration: 'underline', fontSize: '12px' }
      });
      li.appendChild(a);
      list.appendChild(li);
    });
    block.appendChild(list);
    return block;
  }

  function createWidget(opts) {
    var basePath = (opts && opts.basePath) || '';
    var attachTo = (opts && opts.attachTo) || document.body;
    var hideLauncher = !!(opts && opts.hideLauncher);
    var announced404 = false;

    // Root container (positioned)
    var root = createEl('div', {
      attrs: { 'aria-live': 'polite' },
      style: {
        position: 'fixed',
        right: '16px',
        bottom: '16px',
        zIndex: 2147483647
      }
    });

  // Launcher button (optional)
  var launcher = createEl('button', {
      text: 'Need Help?',
      attrs: { type: 'button', 'aria-label': 'Open SparQy assistant' },
      style: {
        background: '#2563eb',
        color: '#ffffff',
        border: 'none',
        borderRadius: '9999px',
        padding: '10px 14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        fontWeight: '600'
      }
    });

    // Panel
    var panel = createEl('div', {
      style: {
        display: 'none',
        width: '340px',
        height: '430px',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        overflow: 'hidden'
      }
    });

    // Header
    var header = createEl('div', {
      style: {
        background: '#111827',
        color: '#ffffff',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    });
    var title = createEl('div', { text: 'SparQy (Virtual Assistant)', style: { fontWeight: '700', fontSize: '14px' } });
    var closeBtn = createEl('button', {
      text: '×',
      attrs: { type: 'button', 'aria-label': 'Close assistant' },
      style: {
        background: 'transparent',
        color: '#ffffff',
        border: 'none',
        fontSize: '20px',
        lineHeight: '1',
        cursor: 'pointer'
      }
    });
    header.appendChild(title);
    header.appendChild(closeBtn);

    // Status / health area
    var status = createEl('div', { style: { padding: '4px 12px', fontSize: '12px', color: '#6b7280', minHeight: '18px' } });

    // Messages scroll area
    var messages = createEl('div', {
      style: {
        padding: '8px 12px',
        height: 'calc(430px - 48px - 22px - 52px)', // total - header - status - input area
        overflowY: 'auto',
        background: '#fafafa'
      }
    });

    // Input area
    var inputWrap = createEl('div', {
      style: {
        display: 'flex',
        gap: '6px',
        padding: '8px 12px',
        borderTop: '1px solid #e5e7eb',
        background: '#ffffff'
      }
    });
    var input = createEl('input', {
      attrs: { type: 'text', placeholder: 'Type a message…', 'aria-label': 'Message input' },
      style: {
        flex: '1',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '8px',
        fontSize: '14px'
      }
    });
    var sendBtn = createEl('button', {
      text: 'Send',
      attrs: { type: 'button', 'aria-label': 'Send message' },
      style: {
        background: '#2563eb',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 10px',
        cursor: 'pointer',
        fontWeight: '600'
      }
    });
    var clearBtn = createEl('button', {
      text: 'Clear',
      attrs: { type: 'button', 'aria-label': 'Clear conversation' },
      style: {
        background: '#f3f4f6',
        color: '#111827',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '8px 10px',
        cursor: 'pointer',
        fontWeight: '600'
      }
    });
    inputWrap.appendChild(input);
    inputWrap.appendChild(sendBtn);
    inputWrap.appendChild(clearBtn);

    // Assemble panel
    panel.appendChild(header);
    panel.appendChild(status);
    panel.appendChild(messages);
    panel.appendChild(inputWrap);

    // Attach
    root.appendChild(panel);
    if (!hideLauncher) {
      root.appendChild(launcher);
    }
    attachTo.appendChild(root);

    // Helper: scroll to bottom
    function scrollToBottom() {
      messages.scrollTop = messages.scrollHeight;
    }

    // Render history array
    function renderHistory(arr) {
      messages.innerHTML = '';
      (arr || []).forEach(function (m) {
        messages.appendChild(msgBubble(m.content || '', m.role === 'user' ? 'user' : 'assistant'));
      });
      scrollToBottom();
    }

    // Network helpers
    function getJson(url) {
      var cands = resolveCandidates(basePath, url);
      var lastErr;
      var i = 0;
      function next() {
        if (i >= cands.length) throw lastErr || new Error('Network error');
        var u = cands[i++];
        return fetch(u, { credentials: 'include' }).then(function (r) {
          if (!r.ok) {
            var err = new Error('HTTP ' + r.status);
            err.status = r.status;
            lastErr = err;
            return next();
          }
          return r.json();
        }).catch(function (e) { lastErr = e; return next(); });
      }
      return next();
    }

    function postJson(url, body) {
      var cands = resolveCandidates(basePath, url);
      var lastErr;
      var i = 0;
      function next() {
        if (i >= cands.length) throw lastErr || new Error('Network error');
        var u = cands[i++];
        return fetch(u, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body || {})
        }).then(function (r) {
          if (!r.ok) {
            var err = new Error('HTTP ' + r.status);
            err.status = r.status;
            lastErr = err;
            return next();
          }
          return r.json();
        }).catch(function (e) { lastErr = e; return next(); });
      }
      return next();
    }

    // Public API
    function open() {
      panel.style.display = 'block';
      if (launcher && launcher.parentNode) launcher.style.display = 'none';
      // Health check (best-effort)
      getJson(joinUrl(basePath, '/api/sparqy/health'))
        .then(function () { status.textContent = ''; })
        .catch(function (e) {
          if (e && e.status === 404 && !announced404) {
            status.textContent = 'SparQy service not found (404).';
            announced404 = true;
          }
          // ignore other errors silently
        });
      // Load history
      getJson(joinUrl(basePath, '/api/sparqy/history'))
        .then(function (data) { renderHistory((data && data.messages) || []); })
        .catch(function (e) {
          if (e && e.status === 401) status.textContent = 'Please sign in again.';
          else if (e && e.status === 404) status.textContent = 'SparQy service not found (404).';
          else status.textContent = 'Network error loading history.';
        });
    }

    function close() {
      panel.style.display = 'none';
      if (!hideLauncher && launcher) launcher.style.display = 'inline-block';
    }

    function clear() {
      postJson(joinUrl(basePath, '/api/sparqy/clear'))
        .then(function () {
          messages.innerHTML = '';
          // reload history for good measure
          return getJson(joinUrl(basePath, '/api/sparqy/history'));
        })
        .then(function (data) { renderHistory((data && data.messages) || []); })
        .catch(function (e) {
          if (e && e.status === 401) status.textContent = 'Please sign in again.';
          else if (e && e.status === 404) status.textContent = 'SparQy service not found (404).';
          else status.textContent = 'Network error clearing history.';
        });
    }

    function send(text) {
      var value = text != null ? String(text) : String(input.value || '');
      if (!value.trim()) return;
      // Render user message immediately
      messages.appendChild(msgBubble(value, 'user'));
      scrollToBottom();
      input.value = '';
      // Typing indicator
      var typing = typingBubble();
      messages.appendChild(typing);
      scrollToBottom();

      postJson(joinUrl(basePath, '/api/sparqy/chat'), { message: value })
        .then(function (data) {
          // Remove typing
          if (typing && typing.parentNode) typing.parentNode.removeChild(typing);
          var reply = (data && data.reply) || '';
          var bubble = msgBubble(reply, 'assistant');
          messages.appendChild(bubble);
          if (data && Array.isArray(data.sources) && data.sources.length) {
            bubble.appendChild(sourcesBlock(data.sources));
          }
          scrollToBottom();
        })
        .catch(function (e) {
          if (typing && typing.parentNode) typing.parentNode.removeChild(typing);
          if (e && e.status === 401) status.textContent = 'Please sign in again.';
          else if (e && e.status === 404) status.textContent = 'SparQy service not found (404).';
          else status.textContent = 'Network error sending message.';
        });
    }

    // Wire events
  if (!hideLauncher && launcher) launcher.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    sendBtn.addEventListener('click', function () { send(); });
    clearBtn.addEventListener('click', clear);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });

    return { open: open, close: close, clear: clear, send: send };
  }

  // Singleton init
  window.initSparqyAssistant = function initSparqyAssistant(opts) {
    try {
      if (window.__sparqyInstance) return window.__sparqyInstance;
      var instance = createWidget(opts || {});
      window.__sparqyInstance = instance;
      return instance;
    } catch (e) {
      // Fail silently to not break host page
      // eslint-disable-next-line no-console
      console && console.error && console.error('SparQy init failed:', e);
      return { open: function(){}, close: function(){}, clear: function(){}, send: function(){} };
    }
  };
})();
