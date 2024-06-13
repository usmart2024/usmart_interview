 document.getElementById('muteButton').addEventListener('click', startRecording )
 document.getElementById('play').addEventListener('click', startInterview )
 document.getElementById('finish').addEventListener('click', finishInterview )
 document.getElementById('openMicButton').addEventListener('click', stopRecording )

     var intervalId;
     let counter = 0;
     let leetCode ;
    let student = {};  // Variável para armazenar os dados do estudante

    // Função para buscar o estudante pelo e-mail
    async function fetchStudentByEmail(email) {
        try {
            const response = await fetch(`/student/${email}`);
            if (!response.ok) {
                throw new Error('Erro ao obter dados do estudante');
            }
            student = await response.json();
            console.log('Dados do estudante carregados:', student);
        } catch (error) {
            console.error('Erro:', error);
        }
    }

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

    function playAudioStream(text) {
        const audioUrl = `http://127.0.0.1:5000/stream/${text}`;
        const audio = new Audio(audioUrl);
        audio.play().catch(error => console.log('Error playing audio:', error));
        audio.addEventListener('ended', function() {
            $("#volume-bars_2").attr("hidden", true);
        });
    }

   function finishInterview() {
       $("#play").attr("hidden", false);
       $("#finish_interview").attr("hidden", true);
       resetCountdown();
   }

    function resetCountdown() {
        clearInterval(intervalId);  // Limpa o intervalo atual
        document.getElementById('cronometro').textContent = "00:15:00";  // Reinicia o display para 15 minutos
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
            $("#volume-bars").attr("hidden", true);
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
                let uuid = student.uuid ;
                formData.append('audio', audioBlob, `cc_audio_${uuid}.wav`);
                formData.append('code', getContent());

                // Enviar o arquivo de áudio para o servidor
                fetch(`/process_answer_cracking_code/${uuid}`, {
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

                        let uuid =  student.uuid

                          console.log('Resposta:', data);
                          const chatBox = document.getElementById('chat-box');
                          chatBox.innerHTML += `<p><strong>You:</strong> ${data.question}</p>`;
                          chatBox.innerHTML += `<p><strong>AI:</strong> ${data.response}</p>`;
                          chatBox.scrollTop = chatBox.scrollHeight;

                       $("#volume-bars").attr("hidden", false);
                        playAudioStream(data.response);

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
        $("#muteButton").attr("hidden", false);
        $("#finish_interview").attr("hidden", false);
        startCountdown();
        leetCode =  getContent();
        let uuid =  student.uuid

        fetch(`/chat/${uuid}`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ message: 'Hello I`m Rodolfo, start the test, please' })
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
              $("#volume-bars").attr("hidden", false);
              playAudioStream(data.response);
          })
          .catch(function(error) {
              console.error('Erro:', error);
          });
   }

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

  function playAudio(uuid) {
      const timestamp = new Date().getTime();
      const audioUrl = `http://127.0.0.1:5000/audio/cc_response_open_ai_${uuid}.mp3?timestamp=${timestamp}`;

      const audio = new Audio(audioUrl);
      audio.play();
      audio.addEventListener('ended', function() {
       $("#volume-bars").attr("hidden", true);
      });
  }

  function getEditorContent() {
      var editor = document.getElementById("editor");
      var htmlContent = editor.innerHTML;
      var textContent = editor.textContent;

      console.log("Text Content:", textContent);

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

  $(document).ready(function () {

  $('#finish').on('click', function() {
        $("#play").attr("hidden", false);
        $("#finish_interview").attr("hidden", true);
        $("#muteButton").attr("hidden", true);
        resetCountdown();
       $('#newModal').modal('hide');
    });

    $('.close, #cancelButton').on('click', function() {
        $('#newModal').modal('hide');
    });

    const studentEmail = 'eurodolfosantos@gmail.com'; // Substitua pelo email do estudante conforme necessário
    fetchStudentByEmail(studentEmail);

  });

