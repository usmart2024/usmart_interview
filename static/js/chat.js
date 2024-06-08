 document.getElementById('muteButton').addEventListener('click', startRecording )

  var mediaRecorder;

  function startRecording() {
    counter++;
    updateQuestionList();

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
                // Criar um objeto Blob com os dados de áudio
                var audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                $("#volume-bars").attr("hidden", true);

                // Criar um objeto FormData e anexar o arquivo de áudio
                var formData = new FormData();
                formData.append('audio', audioBlob, 'audio.wav');

                let previousQuestion = questionsDict[counter -1];
                formData.append('previousQuestion', previousQuestion);

                let currentQuestion = questionsDict[counter];
                formData.append('currentQuestion', currentQuestion);


                // Enviar o arquivo de áudio para o servidor
                fetch('/process_answer', {
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

                        $('#animatedText').text(data.frase);
                        var words = $('#animatedText').text().split(' ');
                        $('#animatedText').empty();

                        // Adiciona cada palavra como um span para controle individual
                        $.each(words, function(i, val) {
                            $('#animatedText').append($('<span>').text(val + ' '));
                        });

                        // Aplica a animação de fade-in para cada palavra individualmente
                        $('#animatedText span').each(function(index) {
                            $(this).css({
                                opacity: 0,
                                position: 'relative',
                                left: '-20px' // começa a partir da esquerda
                            }).delay(300 * index).animate({
                                opacity: 1,
                                left: '0px'  // movimenta para a posição original
                            }, 1000);
                        });
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


 document.getElementById('send-button').addEventListener('click', async () => {
            const userInput = document.getElementById('user-input').value;
            if (userInput.trim() === "") {
                return;
            }
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userInput })
            });
            const data = await response.json();
            const chatBox = document.getElementById('chat-box');
            chatBox.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;
            chatBox.innerHTML += `<p><strong>AI:</strong> ${data.response}</p>`;
            document.getElementById('user-input').value = '';
            chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom
        });
