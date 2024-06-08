// dashboard.js
document.addEventListener('DOMContentLoaded', function () {
    // Dados para o gráfico de pizza
    var pieData = {
        labels: ['A', 'B', 'C', 'D'],
        datasets: [{
            data: [10, 20, 30, 40],
            backgroundColor: ['red', 'blue', 'green', 'yellow']
        }]
    };

    // Configuração do gráfico de pizza
    var pieConfig = {
        type: 'pie',
        data: pieData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Gráfico de Pizza Exemplo'
                }
            }
        }
    };

    // Renderizar o gráfico de pizza
    var pieCtx = document.getElementById('pieChart').getContext('2d');
    new Chart(pieCtx, pieConfig);

    // Dados para o gráfico de barras
    var barData = {
        labels: ['A', 'B', 'C', 'D'],
        datasets: [{
            label: 'Valores',
            data: [10, 20, 30, 40],
            backgroundColor: 'blue'
        }]
    };

    // Configuração do gráfico de barras
    var barConfig = {
        type: 'bar',
        data: barData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Gráfico de Barras Exemplo'
                }
            }
        }
    };

    // Renderizar o gráfico de barras
    var barCtx = document.getElementById('barChart').getContext('2d');
    new Chart(barCtx, barConfig);
});

const data = {
    labels: ['Python', 'AWS', 'Algorithm', 'Sql', 'Design Patterns', 'Architecture', 'POO'],
    datasets: [{
        label: 'Technical Score',
        data: [7, 5, 6, 9, 7, 4, 10],
        backgroundColor: [
            '#000080',
            '#000080',
            '#000080',
            '#000080',
            '#000080',
            '#000080',
            '#000080'
        ],
        borderColor: [
            '#000080',
            '#000080',
            '#000080',
            '#000080',
            '#000080',
            '#000080',
            '#000080'
        ],
        borderWidth: 1 // Ajuste da espessura da borda
    }]
};

// Configurações do gráfico
const config = {
    type: 'bar',
    data: data,
    options: {
        plugins: {
            legend: {
                labels: {
                    color: 'white',
                    font: {
                        size: 14,      // Tamanho da fonte das labels da legenda
                        weight: 'bold' // Peso da fonte das labels da legenda
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: 'white', // Ajuste da cor das labels do eixo x
                    font: {
                        size: 14,      // Tamanho da fonte das labels do eixo x
                        weight: 'bold' // Peso da fonte das labels do eixo x
                    }
                }
            },
            y: {
                ticks: {
                    color: 'white', // Ajuste da cor das labels do eixo y
                    font: {
                        size: 14,      // Tamanho da fonte das labels do eixo y
                        weight: 'bold' // Peso da fonte das labels do eixo y
                    }
                }
            }
        },
        indexAxis: 'y', // Mudar para barras horizontais
        barThickness: 10 // Ajuste da largura da barra
    }
};





    const myChart = new Chart(
      document.getElementById('myChart'),
      config
    );

    const chartVersion = document.getElementById('chartVersion');
    chartVersion.innerText = Chart.version;
