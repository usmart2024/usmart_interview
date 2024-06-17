async function fetchStudentByEmail(email) {
    try {
        const response = await fetch(`/student/${email}`);
        if (!response.ok) {
            throw new Error('Erro ao obter dados do estudante');
        }
        student = await response.json();
        console.log('Dados do estudante carregados:', student);
        displayTable(currentPage); // Chame displayTable após carregar os dados do estudante
        displayTable2(currentPage2); // Chame displayTable após carregar os dados do estudante
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

async function fetchAlgorithmAll() {
    const url = `http://127.0.0.1:5000/algorithms`;
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

async function fetchyourAlgorithmAll() {
    const url = `http://127.0.0.1:5000/student_algorithms_with_details`;
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

var currentPage = 1;
var rowsPerPage = 10;
var data = [];

var currentPage2 = 1;
var rowsPerPage2 = 10;
var data2 = [];

function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
}

async function displayTable(page) {
    data = await fetchAlgorithmAll();

    var start = (page - 1) * rowsPerPage;
    var end = start + rowsPerPage;
    var paginatedData = data.slice(start, end);

    var $tableBody = $("#table-body");
    $tableBody.empty();

    paginatedData.forEach(function(row) {
        var $tr = $("<tr class='fixed-width'>");
        $tr.append($("<td>").text(row.topic));
        $tr.append($("<td>").text(row.question).addClass("fixed-width"));
        $tr.append($("<td hidden>").text(row.id_algorithm));
        $tr.append($("<td class='text-center'>").html('<div class="d-flex justify-content-center"><i class="fas fa-search view-details" data-toggle="modal" data-target="#detailModal"></i></div>'));
        $tableBody.append($tr);
    });

    $("#page-info").text("Page " + page + " of " + Math.ceil(data.length / rowsPerPage));
}

async function displayTable2(page) {
    data2 = await fetchyourAlgorithmAll();

    var start = (page - 1) * rowsPerPage2;
    var end = start + rowsPerPage2;
    var paginatedData = data2.slice(start, end);

    var $tableBody = $("#table-body2");
    $tableBody.empty();

    paginatedData.forEach(function(row) {
        var $tr = $("<tr>");
        $tr.append($("<td>").text(row.topic));
        $tr.append($("<td>").text(truncateText(row.question, 60)).addClass("ellipsis"));
        $tr.append($("<td hidden>").text(row.id_algorithm));
        $tr.append($("<td hidden>").text(row.feedback_code));
        $tr.append($("<td>").html('<i class="fas fa-search view-details2" id="loopa2" data-toggle="modal" data-target="#detailModal3"></i>'));
        $tableBody.append($tr);
    });

    $("#page-info2").text("Page " + page + " of " + Math.ceil(data2.length / rowsPerPage2));
}

$(document).ready(function() {



    var availableTags = [
        "Golang",
        "Aws",
        "Docker",
        "Kubernetes",
        "Sql"
    ];
    $(".autocomplete").autocomplete({
        source: availableTags,
        appendTo: ".container"  // Adiciona a lista dentro do container
    });

    let student = {} ;
    let algorithm = {} ;

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

    $("#prev-page2").click(function() {
        if (currentPage2 > 1) {
            currentPage2--;
            displayTable2(currentPage2);
        }
    });

    $("#next-page2").click(function() {
        if (currentPage2 < Math.ceil(data2.length / rowsPerPage2)) {
            currentPage2++;
            displayTable2(currentPage2);
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

    $(document).on("click", ".view-details", async function() {

        var $row = $(this).closest("tr");
        var question = $row.find("td:nth-child(2)").text();

        algorithm = {'question' : $row.find("td:nth-child(2)").text(),
                     'topic' :  $row.find("td:nth-child(1)").text(),
                     'id_algorithm' :  $row.find("td:nth-child(3)").text()
        }

        $('#algorithmJson').val($row.find("td:nth-child(3)").text());
        $('#stack1').val(question);
    });

    $(document).on("click", ".view-details2", async function() {
        var $row = $(this).closest("tr");
        var topic = $row.find("td:nth-child(1)").text();
        var question = $row.find("td:nth-child(2)").text();
        var feedback_code = $row.find("td:nth-child(4)").text();

        var modalContent = '';

        modalContent += "<div style='border: 1px solid #ddd; 5px; margin-top: 30px; padding: 10px; width:1220px; border-radius: 5px; margin-left: 80px; margin-bottom: 10px;'>";
        modalContent += "<a><strong>Topic:</strong> <i>" +  addLineBreaks(topic, 14) + "</i></a></br>";
        modalContent += "<a><strong>Question:</strong> " + question + "</a></br>";
        modalContent += "</div>";

        var editor = ace.edit("editor");
        editor.setTheme("ace/theme/monokai");
        editor.session.setMode("ace/mode/javascript");
        editor.setFontSize(14);
        editor.renderer.setScrollMargin(10, 10);
        editor.session.setValue(feedback_code);
        editor.renderer.setPadding(3);

        $("#detailModal3 .modal-body2").html(modalContent);
        $("#detailModal3").modal("show");
    });

//    $('#startButton').on('click', function() {
//    alert('linha ')
////       simulateAlgorithm()
//    });

    $('#detailModal').on('hidden.bs.modal', function () {
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    });

    $('.close, #cancelButton').on('click', function() {
        $('#detailModal').modal('hide');
    });

    $('#detailModal3').on('hidden.bs.modal', function () {
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    });

    $('.close, #cancelButton3').on('click', function() {
        $('#detailModal3').modal('hide');
    });
});

document.addEventListener('DOMContentLoaded', function () {
    $('#closeInterview').on('click', function () {
        $('#interviewModal').modal('hide');
    });

    $('#interviewModal').on('hidden.bs.modal', function () {
        $(this).find('form').trigger('reset');
    });
    console.log('fetchStudentByEmail')
    // Chame fetchStudentByEmail uma vez quando a página for carregada
    const studentEmail = 'eurodolfosantos@gmail.com'; // Substitua pelo email do estudante conforme necessário
    fetchStudentByEmail(studentEmail);
});
