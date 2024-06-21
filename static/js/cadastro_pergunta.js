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

    // Dados para a tabela
var data = [
        { topic: "Java", subtopic: "OOP", question: "What is polymorphism in object-oriented programming?", answer: "Polymorphism is the ability of an object to take on many forms. It is one of the core concepts of object-oriented programming..." },
        { topic: "JavaScript", subtopic: "ES6", question: "What is a promise in JavaScript and how do you use it?", answer: "A promise is an object that represents the eventual completion (or failure) of an asynchronous operation, and its resulting value." },
        { topic: "Python", subtopic: "Data Types", question: "What are Python dictionaries and how do you use them?", answer: "Dictionaries are a type of collection in Python that are unordered, changeable, and indexed. They are written with curly brackets, and they have keys and values." },
        { topic: "Java", subtopic: "OOP", question: "What is polymorphism in object-oriented programming?", answer: "Polymorphism is the ability of an object to take on many forms. It is one of the core concepts of object-oriented programming..." },
        { topic: "JavaScript", subtopic: "ES6", question: "What is a promise in JavaScript and how do you use it?", answer: "A promise is an object that represents the eventual completion (or failure) of an asynchronous operation, and its resulting value." },
        { topic: "Python", subtopic: "Data Types", question: "What are Python dictionaries and how do you use them?", answer: "Dictionaries are a type of collection in Python that are unordered, changeable, and indexed. They are written with curly brackets, and they have keys and values." },
        { topic: "Java", subtopic: "OOP", question: "What is polymorphism in object-oriented programming?", answer: "Polymorphism is the ability of an object to take on many forms. It is one of the core concepts of object-oriented programming..." },
        { topic: "JavaScript", subtopic: "ES6", question: "What is a promise in JavaScript and how do you use it?", answer: "A promise is an object that represents the eventual completion (or failure) of an asynchronous operation, and its resulting value." },
        { topic: "Python", subtopic: "Data Types", question: "What are Python dictionaries and how do you use them?", answer: "Dictionaries are a type of collection in Python that are unordered, changeable, and indexed. They are written with curly brackets, and they have keys and values." },
        { topic: "Java", subtopic: "OOP", question: "What is polymorphism in object-oriented programming?", answer: "Polymorphism is the ability of an object to take on many forms. It is one of the core concepts of object-oriented programming..." },
        { topic: "JavaScript", subtopic: "ES6", question: "What is a promise in JavaScript and how do you use it?", answer: "A promise is an object that represents the eventual completion (or failure) of an asynchronous operation, and its resulting value." },
        { topic: "Python", subtopic: "Data Types", question: "What are Python dictionaries and how do you use them?", answer: "Dictionaries are a type of collection in Python that are unordered, changeable, and indexed. They are written with curly brackets, and they have keys and values." },
        { topic: "Java", subtopic: "OOP", question: "What is polymorphism in object-oriented programming?", answer: "Polymorphism is the ability of an object to take on many forms. It is one of the core concepts of object-oriented programming..." },
        { topic: "JavaScript", subtopic: "ES6", question: "What is a promise in JavaScript and how do you use it?", answer: "A promise is an object that represents the eventual completion (or failure) of an asynchronous operation, and its resulting value." },
        { topic: "Python", subtopic: "Data Types", question: "What are Python dictionaries and how do you use them?", answer: "Dictionaries are a type of collection in Python that are unordered, changeable, and indexed. They are written with curly brackets, and they have keys and values." },
        { topic: "Java", subtopic: "OOP", question: "What is polymorphism in object-oriented programming?", answer: "Polymorphism is the ability of an object to take on many forms. It is one of the core concepts of object-oriented programming..." },
        { topic: "JavaScript", subtopic: "ES6", question: "What is a promise in JavaScript and how do you use it?", answer: "A promise is an object that represents the eventual completion (or failure) of an asynchronous operation, and its resulting value." },
        { topic: "Python", subtopic: "Data Types", question: "What are Python dictionaries and how do you use them?", answer: "Dictionaries are a type of collection in Python that are unordered, changeable, and indexed. They are written with curly brackets, and they have keys and values." },
        { topic: "Java", subtopic: "OOP", question: "What is polymorphism in object-oriented programming?", answer: "Polymorphism is the ability of an object to take on many forms. It is one of the core concepts of object-oriented programming..." },
        { topic: "JavaScript", subtopic: "ES6", question: "What is a promise in JavaScript and how do you use it?", answer: "A promise is an object that represents the eventual completion (or failure) of an asynchronous operation, and its resulting value." },
        { topic: "Python", subtopic: "Data Types", question: "What are Python dictionaries and how do you use them?", answer: "Dictionaries are a type of collection in Python that are unordered, changeable, and indexed. They are written with curly brackets, and they have keys and values." },
        { topic: "Java", subtopic: "OOP", question: "What is polymorphism in object-oriented programming?", answer: "Polymorphism is the ability of an object to take on many forms. It is one of the core concepts of object-oriented programming..." },
        { topic: "JavaScript", subtopic: "ES6", question: "What is a promise in JavaScript and how do you use it?", answer: "A promise is an object that represents the eventual completion (or failure) of an asynchronous operation, and its resulting value." },
        { topic: "Python", subtopic: "Data Types", question: "What are Python dictionaries and how do you use them?", answer: "Dictionaries are a type of collection in Python that are unordered, changeable, and indexed. They are written with curly brackets, and they have keys and values." }
    ];

    var currentPage = 1;
    var rowsPerPage = 15;
    var filteredData = data;

    function truncateText(text, maxLength) {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    }

    function displayTable(page, data) {
        var start = (page - 1) * rowsPerPage;
        var end = start + rowsPerPage;
        var paginatedData = data.slice(start, end);

        var $tableBody = $("#table-body");
        $tableBody.empty();

        paginatedData.forEach(function(row) {
            var $tr = $("<tr class='fixed-width'>");
            $tr.append($("<td font-family: 'Roboto',sans-serif;>").text(row.topic).addClass("fixed-width"));
            $tr.append($("<td font-family: 'Roboto',sans-serif;>").text(row.subtopic).addClass("fixed-width"));
            $tr.append($("<td font-family: 'Roboto',sans-serif;>").text(row.question).addClass("fixed-width"));
            $tr.append($("<td>").text(row.answer).addClass("fixed-width"));
            $tableBody.append($tr);
        });

        $("#page-info").text("Page " + page + " of " + Math.ceil(data.length / rowsPerPage));
    }

    $("#prev-page").click(function() {
        if (currentPage > 1) {
            currentPage--;
            displayTable(currentPage, filteredData);
        }
    });

    $("#next-page").click(function() {
        if (currentPage < Math.ceil(filteredData.length / rowsPerPage)) {
            currentPage++;
            displayTable(currentPage, filteredData);
        }
    });

    // Evento para abrir o modal com os detalhes
    $(document).on("click", ".view-details", function() {
        var $row = $(this).closest("tr");
        var topic = $row.find("td:nth-child(1)").text();
        var subtopic = $row.find("td:nth-child(2)").text();
        var question = $row.find("td:nth-child(3)").text();
        var answer = $row.find("td:nth-child(4)").text();

        var modalContent = "<p><strong>Topic:</strong> " + topic + "</p>";
        modalContent += "<p><strong>Subtopic:</strong> " + subtopic + "</p>";
        modalContent += "<p><strong>Question:</strong> " + question + "</p>";
        modalContent += "<p><strong>Answer:</strong> " + answer + "</p>";

        $("#detailModal .modal-body").html(modalContent);
        $("#detailModal").modal("show");
    });

    function filterDataByTopic(topic) {
        if (topic.trim() === "") {
            return data;
        }
        return data.filter(item => item.topic.toLowerCase() === topic.toLowerCase());
    }

    $("#search-button").click(function() {
        const topic = $("#search-input").val();
        filteredData = filterDataByTopic(topic);
        currentPage = 1;  // Resetar para a primeira página ao aplicar o filtro
        displayTable(currentPage, filteredData);
    });

    displayTable(currentPage, data);
});



