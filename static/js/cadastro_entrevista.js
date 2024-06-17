$(document).ready(function() {
    var availableTags = [
        "Golang",
        "Aws",
        "Docker",
        "Kubernete",
        "Sql"
    ];
    $(".autocomplete").autocomplete({
        source: availableTags,
        appendTo: ".container"  // Adiciona a lista dentro do container
    });

    let student = {};

    const studentEmail = 'eurodolfosantos@gmail.com'; // Substitua pelo email do estudante conforme necessário
    fetchStudentByEmail(studentEmail).then(() => {
        // Certifique-se de que a propriedade existe
        displayTable(currentPage); // Chame displayTable após carregar os dados do estudante
    });

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

    async function fetchData(id_student) {
        const url = `http://127.0.0.1:5000/fetch_student_interviews/${id_student}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Dados obtidos:', data);
            return data;
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            return [];
        }
    }

    async function loadInterviewQuestions(id_interview) {
        const url = `http://127.0.0.1:5000/fetch_questions_interviews/${id_interview}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Dados obtidos:', data);
            return data;
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            return [];
        }
    }

    // Dados para a tabela
    var currentPage = 1;
    var rowsPerPage = 10;
    var data = [];

    function truncateText(text, maxLength) {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    }

    async function displayTable(page) {
        data = await fetchData(student.id_student);

        var start = (page - 1) * rowsPerPage;
        var end = start + rowsPerPage;
        var paginatedData = data.slice(start, end);

        var $tableBody = $("#table-body");
        $tableBody.empty();

        paginatedData.forEach(function(row) {
            var $tr = $("<tr>");
            $tr.append($("<td>").text(row.topic));
            $tr.append($("<td>").text(truncateText(row.data_atualizacao, 30)).addClass("ellipsis"));
            $tr.append($("<td>").text(truncateText(row.average_question_score, 30)).addClass("ellipsis"));
            $tr.append($("<td hidden>").text(row.id_interview));
            $tr.append($("<td>").html('<i class="fas fa-search view-details" data-toggle="modal" data-target="#detailModal"></i>'));
            $tableBody.append($tr);
        });

        $("#page-info").text("Page " + page + " of " + Math.ceil(data.length / rowsPerPage));
    }

    $("#prev-page").click(function() {
        if (currentPage > 1) {
            currentPage--;
            displayTable(currentPage);
        }
    });

    $("#next-page").click(function() {
        if (currentPage < Math.ceil(data.length / rowsPerPage)) {
            currentPage++;
            displayTable(currentPage);
        }
    });

    function addLineBreaks(text, wordsPerLine) {
        let words = text.split(' ');
        let result = '';
        for (let i = 0; i < words.length; i++) {
            if (i > 0 && i % wordsPerLine === 0) {
                result += '<br>';
            }
            result += words[i] + ' ';
        }
        return result.trim();
    }

    $(document).on("click", ".view-details", async function() { // Transforme a função em async
        var $row = $(this).closest("tr");
        var topic = $row.find("td:nth-child(1)").text();
        var subtopic = $row.find("td:nth-child(2)").text();
        var question = $row.find("td:nth-child(3)").text();
        var answer = $row.find("td:nth-child(4)").text();

        var data = await loadInterviewQuestions($row.find("td:nth-child(4)").text());

        var modalContent = '';
        data.forEach(function(item) {
            modalContent += "<div style='border: 1px solid #ddd; padding: 10px; margin-bottom: 10px;'>";
            modalContent += "<a><strong>Question:</strong> <i>" +  addLineBreaks(item.question, 14) + "</i></a></br>";
            modalContent += "<a><strong>Ideal answer:</strong> " + item.answer + "</a></br>";
            modalContent += "<a><strong>Your answer:</strong> " + item.student_answer + "</a></br>";
            modalContent += "<a><strong>Technical feedback:</strong> " + item.technical_feedback + "</a></br>";
            modalContent += "<a><strong>English feedback:</strong> " + item.english_feedback + "</a></br>";
            modalContent += "<a><strong>Score:</strong> " + item.score + "</a>";
            modalContent += "</div>";
        });

        $("#detailModal .modal-body").html(modalContent);
        $("#detailModal").modal("show");
    });

    // Redirecionar ao clicar no botão Start
    $('#startButton').on('click', function() {
        window.location.href = 'http://localhost:5000/';
    });

    $('#detailModal').on('hidden.bs.modal', function () {
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    });

    $('.close, #cancelButton').on('click', function() {
        $('#detailModal').modal('hide');
    });

});

document.addEventListener('DOMContentLoaded', function () {
    $('#closeInterview').on('click', function () {
        $('#interviewModal').modal('hide');
    });

    $('#interviewModal').on('hidden.bs.modal', function () {
        $(this).find('form').trigger('reset');
    });
});
