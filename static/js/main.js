$(document).ready(function () {

    let counter = 0;
    let questionsDict = {};
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

    async function loadQuestions() {
        try {
            const response = await fetch(`/questoes/${stack}`);
            if (!response.ok) {
                throw new Error('Erro ao obter questões');
            }
            questionsDict = await response.json();
            console.log('Questões carregadas:', questionsDict);
            updateQuestionList(); // Atualiza a lista com as questões
        } catch (error) {
            console.error('Erro:', error);
        }
    }

    // Função para atualizar a lista de questões
    function updateQuestionList() {
        const questionList = $('#question-list');
        questionList.empty(); // Limpa a lista existente
        $.each(questionsDict, function(index, question) {
            const listItem = $('<li>').text(question).prepend('<i class="fas fa-check-circle"></i> ');
            console.log("index : " + index );
            console.log("counter : " + counter );
            if (index < counter) {
                listItem.addClass('strike');
            }
            questionList.append(listItem);
        });
    }

    // Chamar a função para carregar os dados do estudante e as questões quando a página carregar
    const studentEmail = 'eurodolfosantos@gmail.com'; // Substitua pelo email do estudante conforme necessário
    fetchStudentByEmail(studentEmail);
    loadQuestions();

    document.getElementById('muteButton').addEventListener('click', startRecording );
    document.getElementById('play').addEventListener('click', startInterview );
    document.getElementById('finish').addEventListener('click', finishInterview );
    document.getElementById('openMicButton').addEventListener('click', stopRecording );

    var words = $('#animatedText').text().split(' ');
    $('#animatedText').empty();

    $.each(words, function(i, val) {
        $('#animatedText').append($('<span>').text(val + ' '));
    });

    $('#animatedText span').each(function(index) {
        $(this).css({
            opacity: 0,
            position: 'relative',
            left: '-20px'
        }).delay(300 * index).animate({
            opacity: 1,
            left: '0px'
        }, 1000);
    });

    function playAudio(uuid) {
        const timestamp = new Date().getTime();
        const audioUrl = `http://127.0.0.1:8000/audio/response_open_ai_${uuid}.mp3?timestamp=${timestamp}`;
        const audio = new Audio(audioUrl);
        audio.play();
        audio.addEventListener('ended', function() {
            $("#volume-bars_2").attr("hidden", true);
        });
    }

    document.addEventListener('keydown', async function(event) {
        if (event.key === "Control") {
            // Atualizar a <div> imediatamente antes de enviar a requisição
            $("#button-container").text("Atualizando...");

            var userId = 'user123';  // Este deve ser dinamicamente atribuído conforme sua aplicação
            // Ocultar botão de início e mostrar botão de parada
            $("#muteButton").attr("hidden", true);
            $("#openMicButton").attr("hidden", false);

            try {
                // Enviar requisição para iniciar gravação
                const response = await fetch('/start/' + userId);
                if (!response.ok) {
                    throw new Error('Erro ao iniciar gravação');
                }
                const data = await response.json();
                console.log('Gravação iniciada: ', data.message);
                alterarTextoDoParagrafo(data.message);
            } catch (error) {
                console.error(error);
                // Caso haja erro, rever o estado dos botões
                $("#muteButton").attr("hidden", true);
                $("#openMicButton").attr("hidden", false);
            }
        }
    });

    document.addEventListener('keyup', async function(event) {
        if (event.key === "Control") {
            var userId = 'user123';
            $("#button-container").text("Atualizando...");
            $("#muteButton").attr("hidden", false);
            $("#openMicButton").attr("hidden", true);

            try {
                // Enviar requisição para encerrar gravação
                const response = await fetch('/stop/' + userId);
                if (!response.ok) {
                    throw new Error('Erro ao encerrar gravação');
                }
                const data = await response.json();
                console.log('Gravação encerrada: ', data);
                alterarTextoDoParagrafo(data.message);
                // Atualizar a div após a conclusão da requisição
            } catch (error) {
                console.error(error);
                // Caso haja erro, rever o estado dos botões
                $("#button-container").text("Atualizando...");
                $("#muteButton").attr("hidden", false);
                $("#openMicButton").attr("hidden", true);
            }
        }
    });

    function alterarTextoDoParagrafo(novoTexto) {
        $('#animatedText').text("Novo texto adicionado!");

    }

    function doc_keyUp(e) {
        // this would test for whichever key is 40 (down arrow) and the ctrl key at the same time

        if (e.key === 'j' && e.metaKey) {
            eel.playAssistantSound()
            $("#Oval").attr("hidden", true);
            $("#SiriWave").attr("hidden", false);
            eel.allCommands()()
        }
    }
    document.addEventListener('keyup', doc_keyUp, false);

    // to play assistant
    function PlayAssistant(message) {

        if (message != "") {

            $("#Oval").attr("hidden", true);
            $("#SiriWave").attr("hidden", false);
            eel.allCommands(message);
            $("#chatbox").val("")
            $("#MicBtn").attr('hidden', false);
            $("#SendBtn").attr('hidden', true);

        }

    }

    //eel.expose(startProgressBar);
    function startProgressBar(duration) {
        var bar = document.getElementById('progressBar');
        var startTime = Date.now();

        function update() {
            var elapsedTime = Date.now() - startTime;
            var progress = elapsedTime / duration;
            bar.style.width = progress * 100 + '%';

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    function ShowHideButton(message) {
        if (message.length == 0) {
            $("#MicBtn").attr('hidden', false);
            $("#SendBtn").attr('hidden', true);
        }
        else {
            $("#MicBtn").attr('hidden', true);
            $("#SendBtn").attr('hidden', false);
        }
    }

    // key up event handler on text box
    $("#chatbox").keyup(function () {

        let message = $("#chatbox").val();
        ShowHideButton(message)

    });

    // send button event handler
    $("#SendBtn").click(function () {

        let message = $("#chatbox").val()
        PlayAssistant(message)

    });

    // enter press event handler on chat box
    $("#chatbox").keypress(function (e) {
        key = e.which;
        if (key == 13) {
            let message = $("#chatbox").val()
            PlayAssistant(message)
        }
    });

    var intervalId;  // Armazena o ID do intervalo para acesso global

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

    function resetCountdown() {
        clearInterval(intervalId);  // Limpa o intervalo atual
        document.getElementById('cronometro').textContent = "00:15:00";  // Reinicia o display para 15 minutos
    }

    function startInterview() {
        $("#play").attr("hidden", true);
        $("#finish_interview").attr("hidden", false);
        $("#muteButton").attr("hidden", false);
        startCountdown();

        // Supondo que questionsDict já está carregado e você quer a questão na posição 0
        let question = questionsDict["0"];

        // Substituir espaços por %20 para a URL ser válida
        let encodedQuestion = encodeURIComponent(question);
        let uuid = student.uuid
        fetch(`/generate_question/${encodedQuestion}/${uuid}`, {
            method: 'GET'
        }).then(function(response) {
            if (!response.ok) {
                throw new Error('Erro ao processar a pergunta.');
            }
            return response.json();
        }).then(data => {
            console.log('Resposta:', data.message);
            $('#animatedText').text(question);
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

            playAudio(uuid);
        }).catch(function(error) {
            console.error('Erro:', error);
        });


    }

    function finishInterview() {
        $("#play").attr("hidden", false);
        $("#finish_interview").attr("hidden", true);
        $("#muteButton").attr("hidden", true);
        resetCountdown();
    }

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

                    let uuid = student.uuid

                    // Criar um objeto FormData e anexar o arquivo de áudio
                    var formData = new FormData();
                    formData.append('audio', audioBlob, `audio_${uuid}.wav`);



                    let previousQuestion = questionsDict[counter -1];
                    formData.append('previousQuestion', previousQuestion);

                    let currentQuestion = questionsDict[counter];
                    formData.append('currentQuestion', currentQuestion);


                    // Enviar o arquivo de áudio para o servidor
                    fetch(`/process_answer/${uuid}`, {
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
                        playAudio(uuid);

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

    // Função para tocar o áudio recém carregado
    function stopRecording() {
        $("#muteButton").attr("hidden", false);
        $("#openMicButton").attr("hidden", true);
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();

        }
    }

    $('#startCrackingCodeButton').on('click', function() {
      window.location.href = 'http://localhost:5000/crackingcode';
    });

    $('#finish').on('click', function() {
        $("#play").attr("hidden", false);
        $("#finish_interview").attr("hidden", true);
        $("#muteButton").attr("hidden", true);
        resetCountdown();

        $('#animatedText').text("Let`s start our interview ...");
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


        $('#newModal').modal('hide');
    });

    $('.close, #cancelButton').on('click', function() {
        $('#newModal').modal('hide');
    });

});


document.addEventListener("DOMContentLoaded", function() {
    // Agora você pode usar a variável stack que foi definida no HTML
    console.log("Stack from session:", stack);
    });