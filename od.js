
var stats = [];
var odCount = 1;

let chartData = {};
let offerStat = {};

var resultCount = 0;

$(document).ready(function () {

    $(document.body).on('click', '.area', function (event) {
    });

    var myChart;
    var ctx = document.getElementById("myChart").getContext('2d');


    function renderResult(data) {
        var area = chartData[data];
        var values = [];
        var color = [];

        var dynamicColors = function () {
            var r = Math.floor(Math.random() * 255);
            var g = Math.floor(Math.random() * 255);
            var b = Math.floor(Math.random() * 255);
            return "rgb(" + r + "," + g + "," + b + ",0.5)";
        };
        var countMap = {};
        var templates = [];
        for (var it of data) {
            for (var rec of it) {
                var l = rec.area + " - " + rec.offerId;
                if (!Object.keys(countMap).includes(l)) {
                    countMap[l] = {};
                }
                if (!templates.includes(rec.desc)) {
                    templates.push(rec.desc);
                }
                if (!countMap[l][rec.desc]) {
                    countMap[l][rec.desc] = 1;
                } else {
                    countMap[l][rec.desc]++;
                }
            }
        }
        var labels = Object.keys(countMap);
        labels.sort((a, b) => a.localeCompare(b));
        templates.sort((a, b) => a.localeCompare(b));
        var datasets = templates.map((t) => ({
            label: t,
            backgroundColor: dynamicColors(),
            data: labels.map((l) => countMap[l][t]),
        }));
        for (var offerId in area) {
            labels.push(offerId);
            values.push(area[offerId]);
            color.push(dynamicColors())
        }

        if (myChart) {
            myChart.destroy();
        }

        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets,
            },
            options: {
                barValueSpacing: 20,
                scales: {
                    yAxes: [{
                        ticks: {
                            min: 0,
                        }
                    }]
                }
            }
        });

    }
    function callOD(url, postfix) {

        var odurl = url;
        console.log(odurl);

        $.ajax({
            url: odurl + '&r=' + new Date().getTime(),
            dataType: 'json',
            success: function (json) {

                var recList = [];

                json.forEach(area => {

                    (area.recs).forEach(rec => {
                        if (chartData[area.area]) {
                            offerStat = chartData[area.area]
                            if (offerStat[rec.offerId]) {
                                offerStat[rec.offerId] = offerStat[rec.offerId] + 1;
                            } else {
                                offerStat[rec.offerId] = 1;
                            }

                            chartData[area.area] = offerStat;
                        } else {
                            chartData[area.area] = offerStat;
                            offerStat[rec.offerId] = 1;
                        }
                        offerStat = {};

                        if (rec.offerTemplate) {
                            recList.push({ area: area.area, offerId: rec.offerId, desc: rec.offerTemplate, postfix: postfix, json: encodeURI(JSON.stringify(area)) });
                        }

                    });

                });
                stats.push(recList);


                var table_data = "";

                recList.forEach(rec => {
                    table_data += '<tr><th scope="row">' + odCount + '</th>';
                    table_data += '<td>' + rec.postfix + '</td>';
                    table_data += '<td class="area" data="' + rec.area + '">' + rec.area + '</td>';
                    table_data += '<td>' + rec.offerId + '</td>';
                    table_data += '<td>' + rec.desc + '</td>';
                    table_data += '<td><button type="button" class="btn btn-primary" data-toggle="modal" data-target="#resModal" data-res="' + rec.json + '">View</button></td></tr>';
                })
                odCount++;
                $('.table').append(table_data);

                // renderResult();
                resultCount++;
                if (resultCount === parseInt($("#inputTotal").val())) {
                    renderResult(stats);
                }

            },
            error: function () {
                console.log('something went wrong');
            },
            timeout: 2000
        });

    }

    $('#startButton').on('click', function (e) {
        e.preventDefault();
        resultCount = 0;
        stats = [];
        $("#result_table_body tr").remove();
        var url = $("#inputURL").val();
        var total = parseInt($("#inputTotal").val());
        if (url && url.length > 0) {
            for (var i = 1; i < total + 1; i++) {
                var postfix;
                if (i < 10) {
                    postfix = '00' + i;
                } else {
                    postfix = '0' + i;
                }
                callOD(url.replace('001', postfix), postfix);
            }
        }
    });

    function onChange() {
        $('#inputURL').val('https://datapipeline-api-' + $("input[name='envRadio']:checked").val()
            + '.herokuapp.com/od?ci=' + $("#inputUserPrefix").val().toUpperCase() + '001&p=' + $("#inputPage").val());
    }

    $('input').on('input', onChange);
    $('#inputPage').change(onChange);

    $('#devButton').click(function (e) {
        e.preventDefault();
        $("#result_table_body tr").remove();
        $("#inputUserPrefix").val('TEST');
        $("#inputPage").val('IOS_Youth_Dashboard');
        $("#devRadio").prop("checked", true);
        $("#inputTotal").val('10');
        onChange();
        if (myChart) {
            myChart.destroy();
        }
    });

    $('#qaButton').click(function (e) {
        e.preventDefault();
        $("#result_table_body tr").remove();
        $("#inputUserPrefix").val('TEST');
        $("#inputPage").val('TestChannelLocation');
        $("#qaRadio").prop("checked", true);
        $("#inputTotal").val('10');
        onChange();
        if (myChart) {
            myChart.destroy();
        }
    });

    onChange();

    $('#resModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        var data = button.data('res') // Extract info from data-* attributes
        console.log(data);
        try {
            var json = JSON.stringify(JSON.parse(decodeURI(data)), null, 2);
            $("#resModalBody").html('<pre class="prettyprint lang-js">' + json + '</pre>');
            PR.prettyPrint();
        } catch (error) {
            console.error(error);
            $("#resModalBody").html('<pre class="prettyprint">ERROR</pre>');
        }
    })

});
