 document.getElementById('muteButton').addEventListener('click', startRecording )
 document.getElementById('play').addEventListener('click', startInterview )
 document.getElementById('finish').addEventListener('click', finishInterview )
 document.getElementById('openMicButton').addEventListener('click', stopRecording )

     var intervalId;
     let counter = 0;
     let leetCode ;

     function startCountdown() {
         var display = document.getElementById('cronometro');
         var countdownTime = 15 * 60;  // 15 minutos convertidos em segundos

         clearInterval(intervalId);  // Limpa qualquer intervalo existente antes de iniciar um novo

         intervalId = setInterval(function() {
             var minutes = Math.floor(countdownTime / 60);
             var seconds = countdownTime % 60;

             // Formata os minutos e segundos com dois dígitos
             minutes = minutes < 10 ? '0' + minutes : minutes;
             seconds = seconds < 10 ? '0' + seconds : seconds;

             display.textContent = `00:${minutes}:${seconds}`;

             countdownTime--;  // Decrementa o tempo

             if (countdownTime < 0) {
                 clearInterval(intervalId);  // Para o intervalo quando o tempo chegar a zero
                 display.textContent = "00:00:00";  // Define o display para zero
             }
         }, 1000);  // Define o intervalo para 1 segundo (1000 milissegundos)
     }

   function finishInterview() {
       $("#play").attr("hidden", false);
       $("#finish").attr("hidden", true);
       resetCountdown();
   }

   function stopRecording() {
      $("#muteButton").attr("hidden", false);
      $("#openMicButton").attr("hidden", true);
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();

      }
    }

  var mediaRecorder;

  function startRecording() {
    counter++;

    // Iniciar a captura de áudio
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            // Criar um objeto MediaRecorder para gravar áudio
            mediaRecorder = new MediaRecorder(stream);
            var audioChunks = [];

            $("#muteButton").attr("hidden", true);
            $("#openMicButton").attr("hidden", false);
            $("#volume-bars_2").attr("hidden", true);
            $("#volume-bars").attr("hidden", false);
            // Evento disparado quando há novos dados de áudio disponíveis
            mediaRecorder.ondataavailable = function(event) {
                audioChunks.push(event.data);
            };

            // Evento disparado quando a gravação é parada
            mediaRecorder.onstop = function() {
            console.log(getContent());
                // Criar um objeto Blob com os dados de áudio
                var audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                $("#volume-bars").attr("hidden", true);
                // Criar um objeto FormData e anexar o arquivo de áudio
                var formData = new FormData();
                formData.append('audio', audioBlob, 'audio.wav');
                formData.append('code', getContent());

                // Enviar o arquivo de áudio para o servidor
                fetch('/process_answer_cracking_code', {
                    method: 'POST',
                    body: formData
                })
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('Erro ao salvar o arquivo de áudio.');
                    }
                    return response.json();
                }).then(data => {
                        console.log('Frase recebida:', data.frase);
                        stream.getTracks().forEach(track => track.stop());

                          console.log('Resposta:', data);
                          const chatBox = document.getElementById('chat-box');
                          chatBox.innerHTML += `<p><strong>You:</strong> ${data.question}</p>`;
                          chatBox.innerHTML += `<p><strong>AI:</strong> ${data.response}</p>`;
                          chatBox.scrollTop = chatBox.scrollHeight;

                        $("#volume-bars_2").attr("hidden", false);
                        playAudio();

                    console.log('Arquivo de áudio salvo com sucesso.');
                })
                .catch(function(error) {
                    console.error('Erro:', error);
                });

                stream.getTracks().forEach(track => track.stop());

            };

            // Iniciar a gravação de áudio
            mediaRecorder.start();
        })
        .catch(function(error) {
            console.error('Erro ao obter acesso ao microfone:', error);
        });
}


    function startInterview() {
        $("#play").attr("hidden", true);
        $("#finish").attr("hidden", false);
        startCountdown();
        leetCode =  getContent();
        fetch('/chat', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ message: 'Hello I`m Rodolfo, let`s start ?' })
      })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Erro ao processar a pergunta.');
              }
              return response.json();
          })
          .then(data => {
              console.log('Resposta:', data);
              const chatBox = document.getElementById('chat-box');
              chatBox.innerHTML += `<p><strong>You:</strong> Hello</p>`;
              chatBox.innerHTML += `<p><strong>AI:</strong> ${data.response}</p>`;
              chatBox.scrollTop = chatBox.scrollHeight;

              $("#volume-bars_2").attr("hidden", false);

              playAudio();
          })
          .catch(function(error) {
              console.error('Erro:', error);
          });
   }

// document.getElementById('send-button').addEventListener('click', async () => {
//            const userInput = document.getElementById('user-input').value;
//            if (userInput.trim() === "") {
//                return;
//            }
//            const response = await fetch('/chat', {
//                method: 'POST',
//                headers: { 'Content-Type': 'application/json' },
//                body: JSON.stringify({ message: userInput })
//            });
//            const data = await response.json();
//            const chatBox = document.getElementById('chat-box');
//            chatBox.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;
//            chatBox.innerHTML += `<p><strong>AI:</strong> ${data.response}</p>`;
//            document.getElementById('user-input').value = '';
//            chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom
//        });


    function findDifferences(text1, text2) {
        const lines1 = text1.split('\n');
        const lines2 = text2.split('\n');
        const maxLength = Math.max(lines1.length, lines2.length);
        let differences = '';

        for (let i = 0; i < maxLength; i++) {
            const line1 = lines1[i] || '';
            const line2 = lines2[i] || '';

            if (line1 !== line2) {
                if (line1 && !line2) {
                    differences += `Removido: ${line1}\n`;
                } else if (!line1 && line2) {
                    differences += `Adicionado: ${line2}\n`;
                } else {
                    differences += `Removido: ${line1}\nAdicionado: ${line2}\n`;
                }
            }
        }

        return differences;
    }

  function playAudio() {
      const timestamp = new Date().getTime();
      const audioUrl = 'https://intercode.usmartdigital.com.br:5000/audio/response_open_ai.mp3?timestamp=${timestamp}';

      const audio = new Audio(audioUrl);
      audio.play();
      audio.addEventListener('ended', function() {
       $("#volume-bars_2").attr("hidden", true);

      });
  }

  function getEditorContent() {
      var editor = document.getElementById("editor");
      var htmlContent = editor.innerHTML; // Pega o conteúdo HTML dentro da div
      var textContent = editor.textContent; // Pega apenas o texto, sem qualquer marcação HTML

      console.log("Text Content:", textContent);

      // Caso você precise retornar esses valores
      return {
          html: htmlContent,
          text: textContent
      };
  }

  function  getContent() {
           var editor = ace.edit("editor");
           editor.setTheme("ace/theme/monokai");
           editor.session.setMode("ace/mode/javascript");
           var content = editor.getValue();
           console.log(content);
           return content ;
  }

// Chame esta função para ver os resultados no console


//const differences = findDifferences(text1, text2);
//console.log("Diferenças encontradas:\n", differences);
