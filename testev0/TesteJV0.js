document.addEventListener('DOMContentLoaded', function() {
  // Dados de exemplo (substitua pela lógica de busca de dados real)
  const clientsData = [
      { id: 1, name: "Alex", phone: "+556181495065", email: "alex@example.com", status: "LEAD", lastEditDate: "28/10/2024" },
      { id: 2, name: "Maria", phone: "+556187654321", email: "maria@example.com", status: "PROSPECT", lastEditDate: "29/10/2024" },
      { id: 3, name: "João", phone: "+556189876543", email: "joao@example.com", status: "CLIENT", lastEditDate: "30/10/2024" },
  ];

  const ticketsData = [
      { id: 1, clientId: 1, type: "propertyBuying", status: "AGENDAMENTO", details: "Apartamento 2 quartos, Centro", title: "TAREFA - COMPRA - IMÓVEL", date: "30/10/2024", dataPrincipal: "29/10/2024 10:11", dataReserva: "30/10/2024 10:11" },
      { id: 2, clientId: 1, type: "carBuying", status: "EM ANÁLISE", details: "SUV, até R$ 80.000", title: "TAREFA - COMPRA - CARRO", date: "30/10/2024" },
      { id: 3, clientId: 1, type: "propertySelling", status: "ABERTO", details: "Venda concluída", title: "TAREFA - VENDA - IMÓVEL", date: "31/10/2024" },
      { id: 4, clientId: 2, type: "propertyBuying", status: "NÃO ATENDE", details: "Casa 3 quartos, Jardim Botânico", title: "TAREFA - COMPRA - IMÓVEL", date: "01/11/2024" },
      { id: 5, clientId: 3, type: "carBuying", status: "ENVIADO E AGUARDANDO RETORNO", details: "Sedan, até R$ 100.000", title: "TAREFA - COMPRA - CARRO", date: "02/11/2024" },
  ];

  // Variáveis de estado
  let isLeftPanelOpen = false;
  let isDarkMode = false;
  let selectedClient = null;
  let selectedTicket = null;
  let isEditing = false;
  let ticketFilter = 'active';
  let categoryFilter = 'ALL';

  // Elementos do DOM
  const leftPanel = document.getElementById('leftPanel');
  const mainContent = document.getElementById('mainContent');
  const toggleLeftPanelBtn = document.getElementById('toggleLeftPanel');
  const closeLeftPanelBtn = document.getElementById('closeLeftPanel');
  const toggleDarkModeBtn = document.getElementById('toggleDarkMode');
  const clientList = document.getElementById('clientList');
  const mainContentArea = document.getElementById('mainContentArea');
  const categoryFilterSelect = document.getElementById('categoryFilter');
  const ticketFilterSelect = document.getElementById('ticketFilter');

  // Função para alternar o painel esquerdo
  function toggleLeftPanel() {
      isLeftPanelOpen = !isLeftPanelOpen;
      leftPanel.classList.toggle('-translate-x-full', !isLeftPanelOpen);
      mainContent.classList.toggle('ml-64', isLeftPanelOpen);
      mainContent.style.transition = 'margin-left 200ms ease-in-out';
  }

  // Função para alternar o modo escuro
  function toggleDarkMode() {
      isDarkMode = !isDarkMode;
      document.documentElement.classList.toggle('dark');
      toggleDarkModeBtn.textContent = isDarkMode ? '🌙' : '☀️';
      
      // Forçar a atualização do DOM
      document.body.style.backgroundColor = isDarkMode ? 'black' : 'white';
      
      // Salvar preferência do usuário
      localStorage.setItem('darkMode', isDarkMode);
  }

  // Inicialização do modo escuro
  function initializeDarkMode() {
      // Verifica se há uma preferência salva
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      isDarkMode = savedDarkMode;
      
      if (isDarkMode) {
          document.documentElement.classList.add('dark');
          document.body.style.backgroundColor = 'black';
          toggleDarkModeBtn.textContent = '🌙';
      } else {
          document.documentElement.classList.remove('dark');
          document.body.style.backgroundColor = 'white';
          toggleDarkModeBtn.textContent = '☀️';
      }
  }

  // Função para renderizar a lista de clientes
  function renderClientList() {
      clientList.innerHTML = '';
      clientsData.forEach(client => {
          const clientElement = document.createElement('div');
          clientElement.className = 'flex items-center justify-between';
          clientElement.innerHTML = `
              <button class="w-full justify-start text-gray-700 hover:bg-gray-100" data-client-id="${client.id}">
                  <span>${client.name}</span>
              </button>
              <span class="text-xs text-gray-500 cursor-pointer" data-client-id="${client.id}">${client.lastEditDate}</span>
          `;
          clientList.appendChild(clientElement);
      });
  }

  // Função para lidar com a seleção de um cliente
  function handleClientSelect(clientId) {
      selectedClient = clientsData.find(client => client.id === parseInt(clientId));
      if (selectedClient) {
          if (window.innerWidth < 768) {
              toggleLeftPanel();
          }
          renderMainContent();
      }
  }

  // Função para renderizar o conteúdo principal
  function renderMainContent() {
      if (selectedClient) {
          mainContentArea.innerHTML = `
              <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
                  <div class="bg-red-600 text-white p-2 min-h-[40px] rounded-t-lg">
                      <div class="flex items-center justify-between w-full">
                          <div class="flex items-center gap-1">
                              <h2 class="text-lg">${selectedClient.name}</h2>
                              <button class="text-white hover:text-gray-200 p-0 h-6 w-6 -mr-2">+</button>
                          </div>
                          <select id="ticketFilterInner" class="bg-white text-black h-7 w-[90px] text-sm">
                              <option value="active">Ativos</option>
                              <option value="discarded">Descartados</option>
                          </select>
                      </div>
                  </div>
                  <div class="p-4">
                      <div id="accordionContainer"></div>
                  </div>
              </div>
          `;
          renderAccordion();
      } else {
          mainContentArea.innerHTML = `
              <div class="flex items-center justify-center h-full">
                  <p class="text-xl text-gray-500">Selecione um cliente para ver os detalhes</p>
              </div>
          `;
      }
  }

  // Função para renderizar o acordeão
  function renderAccordion() {
      const accordionContainer = document.getElementById('accordionContainer');
      const accordionItems = [
          { id: "personal", title: "Informações Pessoais", content: [], pendingCount: 0 },
          { id: "propertyBuying", title: "TAREFA - COMPRA - IMÓVEL", content: [], pendingCount: 1 },
          { id: "carBuying", title: "TAREFA - COMPRA - CARRO", content: [], pendingCount: 2 },
          { id: "propertySelling", title: "TAREFA - VENDA - IMÓVEL", content: [], pendingCount: 1 }
      ];

      accordionContainer.innerHTML = '';
      accordionItems.forEach(item => {
          if (categoryFilter === "ALL" || item.title.includes(categoryFilter)) {
              const accordionItem = document.createElement('div');
              accordionItem.className = 'border-b border-gray-200 py-2';
              accordionItem.innerHTML = `
                  <button class="accordion-trigger w-full text-left font-semibold py-2 px-4 hover:bg-gray-100 rounded-md flex items-center justify-between" data-accordion-id="${item.id}">
                      <span>${item.title}</span>
                      ${item.pendingCount > 0 ? `<span class="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">${item.pendingCount}</span>` : ''}
                  </button>
                  <div class="accordion-content hidden px-4 py-2" id="accordion-content-${item.id}"></div>
              `;
              accordionContainer.appendChild(accordionItem);
          }
      });

      // Adiciona ouvintes de eventos aos gatilhos do acordeão
      document.querySelectorAll('.accordion-trigger').forEach(trigger => {
          trigger.addEventListener('click', function() {
              const content = this.nextElementSibling;
              content.classList.toggle('hidden');
              if (!content.classList.contains('hidden')) {
                  renderAccordionContent(this.dataset.accordionId);
              }
          });
      });
  }

  // Função para renderizar o conteúdo do acordeão
  function renderAccordionContent(accordionId) {
      const contentContainer = document.getElementById(`accordion-content-${accordionId}`);
      if (accordionId === 'personal') {
          contentContainer.innerHTML = `
              <table class="w-full">
                  <tr>
                      <td class="font-medium">Nome</td>
                      <td>${selectedClient.name}</td>
                  </tr>
                  <tr>
                      <td class="font-medium">Telefone</td>
                      <td>${selectedClient.phone}</td>
                  </tr>
                  <tr>
                      <td class="font-medium">Email</td>
                      <td>${selectedClient.email}</td>
                  </tr>
                  <tr>
                      <td class="font-medium">Status</td>
                      <td>${selectedClient.status}</td>
                  </tr>
              </table>
          `;
      } else {
          const tickets = ticketsData.filter(ticket => 
              ticket.clientId === selectedClient.id && 
              ticket.type === accordionId &&
              (ticketFilter === "active" ? ticket.status !== "DESCARTADO" : ticket.status === "DESCARTADO")
          );
          
          if (tickets.length > 0) {
              let ticketHTML = '<table class="w-full"><tr><th>TÍTULO</th><th>DATA</th><th>SITUAÇÃO</th><th>PENDÊNCIA</th></tr>';
              tickets.forEach(ticket => {
                  ticketHTML += `
                      <tr class="cursor-pointer" data-ticket-id="${ticket.id}">
                          <td>${ticket.title}</td>
                          <td>
                              <input type="date" value="${ticket.date.split('/').reverse().join('-')}" class="date-input ${getDateColor(ticket.date)}" data-ticket-id="${ticket.id}">
                          </td>
                          <td>
                              <select class="ticket-status" data-ticket-id="${ticket.id}" ${ticketFilter === "discarded" ? 'disabled' : ''}>
                                  ${getStatusOptions(ticket.status)}
                              </select>
                          </td>
                          <td>
                              ${isPending(ticket) ? '⚠️' : ''}
                          </td>
                      </tr>
                  `;
              });
              ticketHTML += '</table>';
              contentContainer.innerHTML = ticketHTML;

              // Adiciona ouvintes de eventos
              contentContainer.querySelectorAll('.date-input').forEach(input => {
                  input.addEventListener('change', function() {
                      handleDateChange(this.dataset.ticketId, this.value);
                  });
              });

              contentContainer.querySelectorAll('.ticket-status').forEach(select => {
                  select.addEventListener('change', function() {
                      handleTicketStatusChange(this.dataset.ticketId, this.value);
                  });
              });

              contentContainer.querySelectorAll('tr[data-ticket-id]').forEach(row => {
                  row.addEventListener('click', function() {
                      handleTicketSelect(this.dataset.ticketId);
                  });
              });
          } else {
              contentContainer.innerHTML = '<p>Nenhum ticket disponível para este perfil.</p>';
          }
      }
  }

  // Função para obter as opções de status
  function getStatusOptions(currentStatus) {
      const allStatuses = ["ABERTO", "EM ANÁLISE", "ENVIADO E AGUARDANDO RETORNO", "NÃO ATENDE", "AGENDAMENTO", "💰 NEGOCIAÇÃO DE VALORES", "📄 BUROCRÁTICO"];
      let options = '';
      allStatuses.forEach(status => {
          if (status === currentStatus || (currentStatus === "ABERTO" && status === "EM ANÁLISE") || status === "ENVIADO E AGUARDANDO RETORNO" || status === "NÃO ATENDE" || status === "AGENDAMENTO") {
              options += `<option value="${status}" ${status === currentStatus ? 'selected' : ''}>${status}</option>`;
          }
      });
      return options;
  }

  // Função para obter a cor da data
  function getDateColor(date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [day, month, year] = date.split('/');
      const ticketDate = new Date(year, month - 1, day);
      ticketDate.setHours(0, 0, 0, 0);
      
      if (ticketDate < today) return 'text-red-500';
      if (ticketDate.getTime() === today.getTime()) return 'text-yellow-500';
      return 'text-green-500';
  }

  // Função para verificar se o ticket está pendente
  function isPending(ticket) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [day, month, year] = ticket.date.split('/');
      const ticketDate = new Date(year, month - 1, day);
      ticketDate.setHours(0, 0, 0, 0);
      
      const isAgendamentoPending = ticket.status === "AGENDAMENTO" && (
          !ticket.dataPrincipal || 
          !ticket.statusAgendamento ||
          ticketDate.getTime() === today.getTime()
      );
      
      return (
          ticket.status === "ABERTO" || 
          ticket.status === "EM ANÁLISE" ||
          ticket.status === "ENVIADO E AGUARDANDO RETORNO" ||
          isAgendamentoPending ||
          (ticket.status === "NÃO ATENDE" && !ticket.motivoNaoAtende) ||
          ticketDate < today
      );
  }

  // Função para lidar com a mudança de data
  function handleDateChange(ticketId, newDate) {
      const ticket = ticketsData.find(t => t.id === parseInt(ticketId));
      if (ticket) {
          const [year, month, day] = newDate.split('-');
          ticket.date = `${day}/${month}/${year}`;
          renderAccordionContent(ticket.type);
      }
  }

  // Função para lidar com a mudança de status do ticket
  function handleTicketStatusChange(ticketId, newStatus) {
      const ticket = ticketsData.find(t => t.id === parseInt(ticketId));
      if (ticket) {
          ticket.status = newStatus;
          if (newStatus === "EM ANÁLISE") {
              ticket.previousStatus = "ABERTO";
          } else if (["ENVIADO E AGUARDANDO RETORNO", "AGENDAMENTO"].includes(newStatus)) {
              ticket.previousStatus = ticket.status;
          }
          renderAccordionContent(ticket.type);
      }
  }

  // Função para lidar com a seleção de um ticket
  function handleTicketSelect(ticketId) {
      selectedTicket = ticketsData.find(t => t.id === parseInt(ticketId));
      renderTicketDetails();
  }

  // Função para renderizar os detalhes do ticket
  function renderTicketDetails() {
      if (!selectedTicket) return;

      const detailsContainer = document.createElement('div');
      detailsContainer.className = 'mt-4 p-4 bg-white rounded-lg shadow';
      detailsContainer.innerHTML = `<h3 class="text-lg font-semibold mb-2">Detalhes do Ticket</h3>`;

      switch (selectedTicket.status) {
          case "ABERTO":
              detailsContainer.innerHTML += `<p>Este ticket está aberto e aguardando ação.</p>`;
              break;
          case "EM ANÁLISE":
              detailsContainer.innerHTML += renderCrossingScreen();
              break;
          case "ENVIADO E AGUARDANDO RETORNO":
              detailsContainer.innerHTML += `
                  <label for="tentativasCobranca">Tentativas de Cobrança</label>
                  <select id="tentativasCobranca" class="w-full mt-1">
                      <option value="">Selecione o número de tentativas</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                  </select>
              `;
              break;
          case "AGENDAMENTO":
              detailsContainer.innerHTML += `
                  <div class="space-y-4">
                      <div class="flex space-x-4">
                          <div class="flex-1">
                              <label for="dataPrincipal">Data e Hora Principal</label>
                              <input type="datetime-local" id="dataPrincipal" class="w-full mt-1" value="${selectedTicket.dataPrincipal || ''}">
                          </div>
                          <div class="flex-1">
                              <label for="dataReserva">Data e Hora Reserva (Opcional)</label>
                              <input type="datetime-local" id="dataReserva" class="w-full mt-1" value="${selectedTicket.dataReserva || ''}">
                          </div>
                      </div>
                      <div>
                          <label for="statusAgendamento">Status do Agendamento</label>
                          <select id="statusAgendamento" class="w-full mt-1">
                              <option value="">Selecione o status do agendamento</option>
                              <option value="AGUARDANDO AMBOS">AGUARDANDO AMBOS</option>
                              <option value="AGUARDANDO PROPRIETARIO / CORRETOR">AGUARDANDO PROPRIETARIO / CORRETOR</option>
                              <option value="AGUARDANDO INTERESSADO">AGUARDANDO INTERESSADO</option>
                              <option value="CONFIRMADO COM AMBOS">CONFIRMADO COM AMBOS</option>
                              <option value="VISITA OCORRIDA">VISITA OCORRIDA</option>
                          </select>
                      </div>
                  </div>
              `;
              break;
          case "NÃO ATENDE":
              detailsContainer.innerHTML += `
                  <div class="space-y-4">
                      <div>
                          <label for="motivoNaoAtende">Motivo de Não Atendimento</label>
                          <select id="motivoNaoAtende" class="w-full mt-1">
                              <option value="">Selecione o motivo</option>
                              ${getPredefinedFields(selectedTicket.type).map(field => `<option value="${field}">${field}</option>`).join('')}
                          </select>
                      </div>
                      <div id="motivoDetalheContainer" class="hidden">
                          <label for="motivoDetalhe">Detalhe do Motivo</label>
                          <input type="text" id="motivoDetalhe" class="w-full mt-1" placeholder="Digite o detalhe do motivo">
                      </div>
                      <button id="moveToDiscarded" class="bg-red-500 text-white px-4 py-2 rounded hidden">Mover para Descartados</button>
                  </div>
              `;
              break;
          default:
              detailsContainer.innerHTML += `<p>Status não reconhecido.</p>`;
      }

      const existingDetails = document.querySelector('.ticket-details');
      if (existingDetails) {
          existingDetails.replaceWith(detailsContainer);
      } else {
          document.getElementById(`accordion-content-${selectedTicket.type}`).appendChild(detailsContainer);
      }

      // Adiciona ouvintes de eventos para os novos elementos
      if (selectedTicket.status === "NÃO ATENDE") {
          const motivoSelect = document.getElementById('motivoNaoAtende');
          const detalheContainer = document.getElementById('motivoDetalheContainer');
          const moveToDiscardedBtn = document.getElementById('moveToDiscarded');

          motivoSelect.addEventListener('change', function() {
              detalheContainer.classList.toggle('hidden', !this.value);
              moveToDiscardedBtn.classList.toggle('hidden', !this.value);
          });

          moveToDiscardedBtn.addEventListener('click', function() {
              const motivo = motivoSelect.value;
              const detalhe = document.getElementById('motivoDetalhe').value;
              if (motivo && detalhe) {
                  selectedTicket.status = "DESCARTADO";
                  selectedTicket.motivoNaoAtende = motivo;
                  selectedTicket.motivoDetalhe = detalhe;
                  renderAccordionContent(selectedTicket.type);
                  renderTicketDetails();
              }
          });
      }
  }

  // Função para renderizar a tela de cruzamento
  function renderCrossingScreen() {
      return `
          <div class="mt-4">
              <div class="mb-4">
                  <img src="/placeholder.svg?height=200&width=400" alt="Imóvel" class="w-full h-48 object-cover rounded-lg">
              </div>
              <table class="w-full">
                  <tr>
                      <th>Informação</th>
                      <th>Cliente</th>
                      <th>Imóvel</th>
                      <th>Status</th>
                  </tr>
                  <tr>
                      <td>Identificação</td>
                      <td>444559529</td>
                      <td>
                          <a href="https://massuhimoveis.com.br/cab-3-reformado-andar-alto-varanda-lazer-completo" class="text-blue-600 hover:underline">
                              Imóvel no site
                          </a>
                      </td>
                      <td>⚠️</td>
                  </tr>
                  <tr>
                      <td>Nome do Contato</td>
                      <td>Iure Brandão</td>
                      <td></td>
                      <td>⚠️</td>
                  </tr>
                  <tr>
                      <td>Telefone do Contato</td><td>+55619783092</td>
                      <td></td>
                      <td>⚠️</td>
                  </tr>
                  <tr>
                      <td>Situação Geral</td>
                      <td>ARQUIVAR LEAD: JÁ COMPROU</td>
                      <td></td>
                      <td>⚠️</td>
                  </tr>
                  <tr>
                      <td>Atendimento</td>
                      <td>0.0.2 - ✓ VALIDAR OPÇÕES ( TRADICIONAL)</td>
                      <td></td>
                      <td>⚠️</td>
                  </tr>
                  <tr>
                      <td>Bairro</td>
                      <td>Taguatinga</td>
                      <td>Taguatinga Sul (Taguatinga)</td>
                      <td>❌</td>
                  </tr>
                  <tr>
                      <td>Observações sobre o Bairro</td>
                      <td>Na comercial seria o ideal</td>
                      <td></td>
                      <td>⚠️</td>
                  </tr>
                  <tr>
                      <td>Metragem Mínima</td>
                      <td>50,00</td>
                      <td>83</td>
                      <td>✅</td>
                  </tr>
                  <tr>
                      <td>Quartos</td>
                      <td>2</td>
                      <td>3</td>
                      <td>✅</td>
                  </tr>
                  <tr>
                      <td>Valor de Venda</td>
                      <td>R$ 299.000,00</td>
                      <td>300000</td>
                      <td>❌</td>
                  </tr>
              </table>
              <div class="mt-4 flex justify-end">
                  <button class="bg-gray-200 text-gray-800 px-4 py-2 rounded">Editar Dados</button>
              </div>
          </div>
      `;
  }

  // Função para obter campos predefinidos
  function getPredefinedFields(type) {
      const predefinedFields = {
          propertyBuying: [
              "Valor acima do orçamento",
              "Localização não desejada",
              "Tamanho inadequado",
              "Falta de características desejadas",
              "Condições de pagamento incompatíveis",
              "Outro"
          ],
          carBuying: [
              "Preço acima do orçamento",
              "Modelo indisponível",
              "Marca não preferida",
              "Ano do veículo inadequado",
              "Tipo de combustível incompatível",
              "Outro"
          ],
          propertySelling: [
              "Valor de venda abaixo do esperado",
              "Localização não atrativa para compradores",
              "Tamanho do imóvel inadequado para o mercado",
              "Condições do imóvel não satisfatórias",
              "Documentação incompleta",
              "Outro"
          ]
      };
      return predefinedFields[type] || [];
  }

  // Ouvintes de eventos
  toggleLeftPanelBtn.addEventListener('click', toggleLeftPanel);
  closeLeftPanelBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleLeftPanel();
  });
  toggleDarkModeBtn.addEventListener('click', toggleDarkMode);
  categoryFilterSelect.addEventListener('change', function() {
      categoryFilter = this.value;
      if (selectedClient) {
          renderMainContent();
      }
  });
  ticketFilterSelect.addEventListener('change', function() {
      ticketFilter = this.value;
      if (selectedClient) {
          renderMainContent();
      }
  });

  // Inicializa o aplicativo
  renderClientList();
  clientList.addEventListener('click', function(e) {
      const clientElement = e.target.closest('[data-client-id]');
      if (clientElement) {
          const clientId = clientElement.dataset.clientId;
          handleClientSelect(clientId);
      }
  });
});