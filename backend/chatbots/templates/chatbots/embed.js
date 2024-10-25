(function initChatbot() {
  try {
    // Get config first
    const config = {
      embedId: '{{ chatbot.embed_id }}',
      name: '{{ chatbot.name }}',
      primaryColor: '{{ chatbot.primary_color }}',
      secondaryColor: '{{ chatbot.secondary_color }}',
      borderRadius: '{{ chatbot.chatbot_border_radius }}',
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
    const tailwindScript = document.createElement('script');
    tailwindScript.src = 'https://cdn.tailwindcss.com';
    document.head.appendChild(tailwindScript);

    function initWebSocket(params = {}) {
      // Construct WebSocket URL with query parameters
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsBase = `${wsProtocol}//localhost:8000/ws/chat/${config.embedId}/`;

      // Add query parameters if they exist
      const queryParams = new URLSearchParams(params).toString();
      const wsUrl = queryParams ? `${wsBase}?${queryParams}` : wsBase;

      ws = new WebSocket(wsUrl);

      ws.onopen = function () {
        console.log('WebSocket connection established');
      };

      ws.onmessage = function (event) {
        const response = JSON.parse(event.data).response;
        if (response) {
          appendMessage('bot', response);
        }
      };

      ws.onerror = function (error) {
        console.error('WebSocket error:', error);
      };

      return ws;
    }

    function appendMessage(sender, message, isTyping = false) {
      const messagesContainer = document.getElementById('ai-chat-messages');

      // Remove existing typing indicator if any
      const existingTypingIndicator =
        messagesContainer.querySelector('.typing-indicator');
      if (existingTypingIndicator) {
        existingTypingIndicator.remove();
      }

      const messageDiv = document.createElement('div');
      messageDiv.className = `flex items-start gap-3 mb-6`; // Increased gap between icon and message

      if (isTyping) {
        messageDiv.classList.add('typing-indicator');
        messageDiv.innerHTML = `
              <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background-color: ${config.primaryColor}">
                      <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                  </div>
                  <div class="flex gap-2 p-3 max-w-[80%]" style="background-color: ${config.primaryColor}20; border-radius: ${config.borderRadius}px">
                      <div class="w-2 h-2 rounded-full animate-pulse" style="background-color: ${config.primaryColor}"></div>
                      <div class="w-2 h-2 rounded-full animate-pulse delay-100" style="background-color: ${config.primaryColor}"></div>
                      <div class="w-2 h-2 rounded-full animate-pulse delay-200" style="background-color: ${config.primaryColor}"></div>
                  </div>
              </div>
          `;
      } else {
        messageDiv.innerHTML =
          sender === 'user'
            ? `
              <div class="ml-auto flex items-start gap-2">
                  <div class="p-3 max-w-[80%] text-white" style="background-color: ${config.primaryColor}; color: ${config.secondaryColor}; border-radius: ${config.borderRadius}px">
                      <p>${message}</p>
                  </div>
                  <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                      </svg>
                  </div>
              </div>
          `
            : `
              <div class="flex items-start gap-2">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background-color: ${config.primaryColor}">
                      <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                  </div>
                  <div class="p-3 max-w-[80%]" style="background-color: ${config.primaryColor}20; border-radius: ${config.borderRadius}px">
                      <p>${message}</p>
                  </div>
              </div>
          `;
      }

      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function sendMessage(query) {
      if (query && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ query: query }));
        appendMessage('user', query);
        setTimeout(() => {
          appendMessage('bot', '', true);
        }, 300);
      }
    }

    function initChatWidget() {
      // First create the widget button
      const widgetHTML = `
          <button id="ai-chat-widget"
              class="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110"
              style="background-color: ${config.widgetColor}; border-radius: ${config.widgetBorderRadius}px">
              <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
          <div class="fixed bottom-8 right-8 flex flex-col items-center font-inter">
              <div class="w-[350px] h-[500px] rounded-lg flex flex-col bg-white shadow-lg"
                  style="border-radius: ${config.borderRadius}px; font-size: ${
        config.fontSize
      }px">
                  <div class="p-4 flex items-center justify-between"
                      style="background-color: ${
                        config.primaryColor
                      }; border-top-left-radius: ${
        config.borderRadius
      }px; border-top-right-radius: ${config.borderRadius}px">
                      <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background-color: ${
                            config.primaryColor
                          }">
                              <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                              </svg>
                          </div>
                          <span class="font-medium" style="color: ${
                            config.secondaryColor
                          }">${config.title || 'AI Assistant'}</span>
                      </div>
                      <div class="flex items-center gap-3">
                          <button id="ai-chat-end"
                              class="text-sm px-3 py-1.5 rounded font-medium border hover:bg-white/20 transition-colors"
                              style="color: ${
                                config.secondaryColor
                              }; border-color: ${config.secondaryColor}">
                              End chat
                          </button>
                          <button id="ai-chat-minimize" class="p-2 rounded-full hover:bg-white/10" title="Minimize chat">
                              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: ${
                                config.secondaryColor
                              }">
                                  <path d="M18 6L6 18M6 6l12 12"></path>
                              </svg>
                          </button>
                      </div>
                  </div>

                  <div id="ai-chat-messages" class="flex-1 p-4 overflow-y-auto space-y-6">
                      <form id="ai-chat-form" class="flex flex-col space-y-6 p-4">
                          <p class="text-gray-800">Please fill out this form before chatting with our assistant:</p>
                          <div class="space-y-4">
                              <input type="text" name="full_name" placeholder="Full Name *" required
                                  class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1"
                                  style="border-radius: ${
                                    config.borderRadius
                                  }px; --tw-ring-color: ${config.primaryColor}">
                              <input type="email" name="email" placeholder="Email Address *" required
                                  class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1"
                                  style="border-radius: ${
                                    config.borderRadius
                                  }px; --tw-ring-color: ${config.primaryColor}">
                              <button type="submit"
                                  class="w-full p-3 text-white font-medium hover:opacity-90 transition-colors"
                                  style="background-color: ${
                                    config.primaryColor
                                  }; border-radius: ${config.borderRadius}px">
                                  Start Chat
                              </button>
                          </div>
                      </form>
                  </div>

                  <div id="chat-input-area" class="p-4 border-t" style="display: none;">
                      <div class="flex items-center gap-2">
                          <input type="text" id="ai-chat-input-field" placeholder="Type a message..."
                              class="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1"
                              style="border-radius: ${
                                config.borderRadius
                              }px; --tw-ring-color: ${config.primaryColor}">
                          <button id="ai-chat-send"
                              class="w-10 h-10 flex items-center justify-center text-white hover:opacity-90 transition-colors"
                              style="background-color: ${
                                config.primaryColor
                              }; color: ${
        config.secondaryColor
      }; border-radius: ${config.borderRadius}px">
                              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                              </svg>
                          </button>
                      </div>
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
              <form id="ai-chat-form" class="flex flex-col space-y-6 p-4">
                  <p class="text-gray-800">Please fill out this form before chatting with our assistant:</p>
                  <div class="space-y-4">
                      <input type="text" name="full_name" placeholder="Full Name *" required
                          class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                          style="border-radius: ${config.borderRadius}px; --tw-ring-color: ${config.primaryColor}">
                      <input type="email" name="email" placeholder="Email Address *" required
                          class="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2"
                          style="border-radius: ${config.borderRadius}px; --tw-ring-color: ${config.primaryColor}">
                      <button type="submit"
                          class="w-full p-3 text-white font-medium hover:opacity-90 transition-colors"
                          style="background-color: ${config.primaryColor}; border-radius: ${config.borderRadius}px">
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
        document
          .getElementById('ai-chat-form')
          .addEventListener('submit', function (e) {
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
              document.getElementById('chat-input-area').style.display =
                'block';

              setTimeout(() => {
                appendMessage('bot', '', true);
              }, 300);
            };
          });
      }

      // Initial form handler attachment
      attachFormSubmitHandler();

      document.getElementById('ai-chat-send').addEventListener('click', () => {
        const input = document.getElementById('ai-chat-input-field');
        const query = input.value.trim();
        if (query) {
          sendMessage(query);
          input.value = '';
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
              sendMessage(query);
              input.value = '';
            }
          }
        });
    }

    // Wait for Tailwind to load before initializing the widget
    tailwindScript.onload = function () {
      window.tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              inter: ['Inter', 'sans-serif'],
            },
          },
        },
      };
      initChatWidget();
    };
  } catch (error) {
    console.error('Failed to initialize chatbot:', error);
  }
})();
