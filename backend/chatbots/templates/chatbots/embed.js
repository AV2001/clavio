(function initChatbot() {
  try {
    // Get config first
    const config = {
      embedId: '{{ chatbot.embed_id }}',
      name: '{{ chatbot.name }}',
      primaryColor: '{{ chatbot.primary_color }}',
      secondaryColor: '{{ chatbot.secondary_color }}',
      chatbotBorderRadius: '{{ chatbot.chatbot_border_radius }}',
      fontSize: '{{ chatbot.font_size }}',
      widgetColor: '{{ chatbot.widget_color|default:chatbot.primary_color }}',
      widgetBorderRadius:
        '{{ chatbot.widget_border_radius|default:chatbot.chatbot_border_radius }}',
      botImage: '{{ chatbot.image|default:"" }}',
      wsUrl: '{{ ws_url }}',
    };
    let ws;

    // Add Inter font
    const fontLink = document.createElement('link');
    fontLink.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // Add Tailwind CSS
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }

        #ai-chat-widget {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            padding: 15px !important;
            box-shadow: 0 2px 12px rgba(0,0,0,0.1) !important;
            cursor: pointer !important;
            transition: transform 0.15s !important;
        }
        #ai-chat-widget:hover {
            transform: scale(1.1);
        }

        #ai-chat-container {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            width: 380px !important;
            box-shadow: 0 2px 12px rgba(0,0,0,0.1) !important;
        }

        #ai-chat-messages {
            height: 400px !important;
            background-color: #FFF !important;
        }

        .message-bubble-user {
            background-color: ${config.primaryColor} !important;
            color: white !important;
            padding: 10px 15px !important;
            border-radius: 15px !important;
            max-width: 70% !important;
        }

        .message-bubble-bot {
            background-color: white !important;
            padding: 10px 15px !important;
            border-radius: 15px !important;
            max-width: 70% !important;
        }

        .avatar {
            width: 30px !important;
            height: 30px !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        .avatar-user {
            background: #ddd !important;
        }

        .avatar-bot {
            background: ${config.primaryColor} !important;
            color: white !important;
        }

        #chat-input-area {
            background: white !important;
            border-top: 1px solid #eee !important;
        }

        #ai-chat-input-field {
            flex: 1 !important;
            padding: 10px !important;
            border: 1px solid #ddd !important;
        }

        #ai-chat-input-field:focus {
            border: 1px solid ${config.primaryColor} !important;
            outline: none !important;
        }
    `;
    document.head.appendChild(styleSheet);

    function initWebSocket(params) {
      const queryParams = new URLSearchParams({
        fullName: params.fullName,
        email: params.email,
      }).toString();

      // Use the base ws_url from config and append the path
      const wsUrl = `${config.wsUrl}/ws/chat/${config.embedId}/?${queryParams}`;
      return new WebSocket(wsUrl);
    }

    function appendMessage(sender, message, isTyping = false) {
      const messagesContainer = document.getElementById('ai-chat-messages');
      const messageDiv = document.createElement('div');
      messageDiv.style.marginBottom = '15px';

      if (sender === 'user') {
        messageDiv.innerHTML = `
            <div style="display: flex; justify-content: flex-end; gap: 10px; align-items: flex-start;">
                <div style="background-color: ${config.primaryColor}; color: ${config.secondaryColor}; padding: 10px 15px; border-radius: 15px; max-width: 70%;">
                    <p style="margin: 0;">${message}</p>
                </div>
                <div style="width: 30px; height: 30px; background: #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 3px;">
                    <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
            </div>
        `;
      } else {
        const typingId = isTyping ? `typing-${Date.now()}` : null;
        messageDiv.innerHTML = `
            <div style="display: flex; gap: 10px; align-items: flex-start;">
                <div style="width: 30px; height: 30px; background: ${
                  config.primaryColor
                }; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 3px;">
                    <svg style="width: 20px; height: 20px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                </div>
                <div style="background-color: ${
                  config.primaryColor
                }20; padding: 10px 15px; border-radius: 15px; max-width: 70%;">
                    ${
                      isTyping
                        ? `<div id="${typingId}" style="display: flex; gap: 3px; padding: 5px;">
                            <div style="width: 6px; height: 6px; background: ${config.primaryColor}; border-radius: 50%; animation: bounce 0.8s infinite;"></div>
                            <div style="width: 6px; height: 6px; background: ${config.primaryColor}; border-radius: 50%; animation: bounce 0.8s infinite 0.2s;"></div>
                            <div style="width: 6px; height: 6px; background: ${config.primaryColor}; border-radius: 50%; animation: bounce 0.8s infinite 0.4s;"></div>
                        </div>`
                        : `<p style="margin: 0;">${message}</p>`
                    }
                </div>
            </div>
        `;
      }

      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      return messageDiv; // Return the entire message div for later reference
    }

    function sendMessage(query) {
      if (query && ws && ws.readyState === WebSocket.OPEN) {
        // Send user message
        ws.send(JSON.stringify({ query: query }));
        appendMessage('user', query);

        // Create typing indicator
        const typingMessageDiv = appendMessage('bot', '', true);

        // Update the onmessage handler
        ws.onmessage = function (event) {
          const response = JSON.parse(event.data).response;
          if (response) {
            // Find the typing indicator message div
            const typingDiv = typingMessageDiv.querySelector('[id^="typing-"]');
            if (typingDiv) {
              // Replace the typing animation with the actual message
              const messageContainer = typingDiv.parentElement;
              messageContainer.innerHTML = `<p style="margin: 0;">${response}</p>`;
            }
          }
        };
      }
    }

    function initChatWidget() {
      // Update widget HTML to include chatbot icon
      const widgetHTML = `
          <button id="ai-chat-widget"
              style="background-color: ${config.widgetColor}; border-radius: ${config.widgetBorderRadius}px; border: none; display: flex; align-items: center; justify-content: center;">
              <svg style="width: 24px; height: 24px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
          </button>
      `;

      const widgetContainer = document.createElement('div');
      widgetContainer.innerHTML = widgetHTML;
      document.body.appendChild(widgetContainer);

      const chatContainer = document.createElement('div');
      chatContainer.style.display = 'none'; // Hide chat window initially

      // Create the chat window HTML (but don't show it yet)
      const chatHTML = `
          <div id="ai-chat-container" style="position: fixed; bottom: 20px; right: 20px; width: 380px; background: white; border-radius: ${config.chatbotBorderRadius}px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); font-family: 'Inter', sans-serif;">
              <div style="background: ${config.primaryColor}; padding: 15px; display: flex; justify-content: space-between; align-items: center; border-top-left-radius: ${config.chatbotBorderRadius}px; border-top-right-radius: ${config.chatbotBorderRadius}px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                      <svg style="width: 24px; height: 24px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                      <span style="color: ${config.secondaryColor}; font-weight: 500;">${config.name}</span>
                  </div>
                  <div style="display: flex; gap: 10px; align-items: center;">
                      <button id="ai-chat-end" style="color: ${config.secondaryColor}; border: 1px solid ${config.secondaryColor}; padding: 5px 15px; border-radius: 5px; background: transparent; cursor: pointer;">
                          End chat
                      </button>
                      <button id="ai-chat-minimize" style="background: none; border: none; padding: 5px; cursor: pointer;">
                          <svg style="width: 20px; height: 20px; color: ${config.secondaryColor};" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M18 6L6 18M6 6l12 12"></path>
                          </svg>
                      </button>
                  </div>
              </div>

              <div id="ai-chat-messages" style="height: 400px; overflow-y: auto; padding: 20px; background-color: ${config.secondaryColor};">
                  <form id="ai-chat-form" style="padding: 20px;" onsubmit="document.querySelector('#ai-chat-form button').disabled = true; document.querySelector('#ai-chat-form button').innerHTML = 'Connecting...';">
                      <p style="margin-bottom: 15px;">Please fill out this form before chatting with our assistant:</p>
                      <div style="display: flex; flex-direction: column; gap: 10px;">
                          <input type="text" name="full_name" placeholder="Full Name *" required
                              style="padding: 10px; border: 1px solid #ddd; border-radius: ${config.chatbotBorderRadius}px; outline: none;"
                              onFocus="this.style.border='1px solid ${config.primaryColor}'"
                              onBlur="this.style.border='1px solid #ddd'">
                          <input type="email" name="email" placeholder="Email Address *" required
                              style="padding: 10px; border: 1px solid #ddd; border-radius: ${config.chatbotBorderRadius}px; outline: none;"
                              onFocus="this.style.border='1px solid ${config.primaryColor}'"
                              onBlur="this.style.border='1px solid #ddd'">
                          <button type="submit"
                            style="background-color: ${config.primaryColor}; color: white; padding: 10px; border: none; border-radius: ${config.chatbotBorderRadius}px; cursor: pointer;">
                              Start Chat
                          </button>
                      </div>
                  </form>
              </div>

              <div id="chat-input-area" style="padding: 15px; border-top: 1px solid #eee; display: none;">
                  <div style="display: flex; gap: 10px;">
                      <input type="text"
                          id="ai-chat-input-field"
                          placeholder="Type a message..."
                          style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: ${config.chatbotBorderRadius}px; outline: none;"
                          onFocus="this.style.border='1px solid ${config.primaryColor}'"
                          onBlur="this.style.border='1px solid #ddd'">
                      <button id="ai-chat-send"
                          style="background-color: ${config.primaryColor}; border: none; padding: 10px; border-radius: ${config.chatbotBorderRadius}px; cursor: pointer; display:flex; align-items: center; justify-content:center;">
                          <svg style="width: 20px; height: 20px; color: ${config.secondaryColor};" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                          </svg>
                      </button>
                  </div>
              </div>
          </div>
      `;

      chatContainer.innerHTML = chatHTML;
      document.body.appendChild(chatContainer);

      // Widget click handler - only shows chat window, no WebSocket connection
      document
        .getElementById('ai-chat-widget')
        .addEventListener('click', () => {
          chatContainer.style.display = 'block';
          widgetContainer.style.display = 'none';
        });

      // Minimize click handler - only hides chat window
      document
        .getElementById('ai-chat-minimize')
        .addEventListener('click', () => {
          chatContainer.style.display = 'none';
          widgetContainer.style.display = 'block';
          // Don't close WebSocket here
        });

      // End chat handler - closes WebSocket and resets the chat
      document.getElementById('ai-chat-end').addEventListener('click', () => {
        if (ws) {
          ws.close();
          ws = null;
        }

        const messagesContainer = document.getElementById('ai-chat-messages');
        messagesContainer.innerHTML = `
              <form id="ai-chat-form" style="padding: 20px;" onsubmit="document.querySelector('#ai-chat-form button').disabled = true; document.querySelector('#ai-chat-form button').innerHTML = 'Connecting...';">
                  <p style="margin-bottom: 15px;">Please fill out this form before chatting with our assistant:</p>
                  <div style="display: flex; flex-direction: column; gap: 10px;">
                      <input type="text" name="full_name" placeholder="Full Name *" required
                          style="padding: 10px; border: 1px solid #ddd; border-radius: ${config.chatbotBorderRadius}px; outline: none; background-color:none !important"
                          onFocus="this.style.border='1px solid ${config.primaryColor}'"
                          onBlur="this.style.border='1px solid #ddd'">
                      <input type="email" name="email" placeholder="Email Address *" required
                          style="padding: 10px; border: 1px solid #ddd; border-radius: ${config.chatbotBorderRadius}px; outline: none; background-color:none !important"
                          onFocus="this.style.border='1px solid ${config.primaryColor}'"
                          onBlur="this.style.border='1px solid #ddd'">
                      <button type="submit"
                          style="background-color: ${config.primaryColor}; color: white; padding: 10px; border: none; border-radius: ${config.chatbotBorderRadius}px; cursor: pointer;">
                          Start Chat
                      </button>
                  </div>
              </form>
          `;

        // Hide input area until next form submission
        document.getElementById('chat-input-area').style.display = 'none';

        // Reattach form submit handler
        attachFormSubmitHandler();
      });

      function attachFormSubmitHandler() {
        const form = document.getElementById('ai-chat-form');
        if (!form) return;

        form.addEventListener('submit', function (e) {
          e.preventDefault();

          // Get form data
          const formData = new FormData(this);
          const params = {
            fullName: formData.get('full_name'),
            email: formData.get('email'),
          };

          // Initialize WebSocket with form parameters
          ws = initWebSocket(params);

          ws.onopen = () => {
            // Remove the form
            this.remove();

            // Show the chat input area
            document.getElementById('chat-input-area').style.display = 'block';

            // Create typing indicator and store reference
            const typingMessageDiv = appendMessage('bot', '', true);

            // Update onmessage to handle the initial greeting
            ws.onmessage = function (event) {
              const response = JSON.parse(event.data).response;
              if (response) {
                // Find and replace typing indicator with actual message
                const typingDiv =
                  typingMessageDiv.querySelector('[id^="typing-"]');
                if (typingDiv) {
                  const messageContainer = typingDiv.parentElement;
                  messageContainer.innerHTML = `<p style="margin: 0;">${response}</p>`;
                }

                // Reset onmessage to normal handler for future messages
                ws.onmessage = function (event) {
                  const response = JSON.parse(event.data).response;
                  if (response) {
                    appendMessage('bot', response);
                  }
                };
              }
            };
          };
        });
      }

      // Initial form handler attachment
      attachFormSubmitHandler();

      // Add event listeners
      document.getElementById('ai-chat-send').addEventListener('click', () => {
        const input = document.getElementById('ai-chat-input-field');
        const query = input.value.trim();
        if (query) {
          input.value = ''; // Clear input immediately
          sendMessage(query);
        }
      });

      document
        .getElementById('ai-chat-input-field')
        .addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const input = document.getElementById('ai-chat-input-field');
            const query = input.value.trim();
            if (query) {
              input.value = ''; // Clear input immediately
              sendMessage(query);
            }
          }
        });
    }

    // Initialize the widget
    initChatWidget();
  } catch (error) {
    console.error('Failed to initialize chatbot:', error);
  }
})();
