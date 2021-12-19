// First and foremost,
if (document.location.search === '') {
    document.location.search = 'size=20';
}

// Request
function getData(input, url) {
    console.log("Fui chamado por " + input + " !" + " e fiz a requisicao em " + url + " !")
    var request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'json';
    request.send();
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var table = document.getElementById("tableRegistros");
            var parentDiv = table.parentNode;
            if (request.response == null) {
                alert("Nenhum registro encontrado")
            } else {
                parentDiv.replaceChild(buildHtmlTable(request.response), table);
            }
        } else if (this.readyState == 4) {
            alert("Erro - Falha na busca de registros");
            console.log(this.readyState, this.status)
        }
    }
}

// JSON to table
// Thanks to: https://stackoverflow.com/a/21065846
// Builds the HTML Table out of myList json data from Ivy restful service.
function buildHtmlTable(arr) {
    var table = _table_.cloneNode(false),
        columns = addAllColumnHeaders(arr, table);
    for (var i = 0, maxi = arr.length; i < maxi; ++i) {
        var tr = _tr_.cloneNode(false);
        for (var j = 0, maxj = columns.length; j < maxj; ++j) {
            var td = _td_.cloneNode(false);
            cellValue = arr[i][columns[j]];
            td.appendChild(document.createTextNode(arr[i][columns[j]] || ''));
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    table.setAttribute("id", "tableRegistros");
    return table;
}

// Adds a header row to the table and returns the set of columns.
// Need to do union of keys from all records as some records may not contain
// all records
function addAllColumnHeaders(arr, table) {
    var columnSet = [],
        tr = _tr_.cloneNode(false);
    for (var i = 0, l = arr.length; i < l; i++) {
        for (var key in arr[i]) {
            if (arr[i].hasOwnProperty(key) && columnSet.indexOf(key) === -1) {
                columnSet.push(key);
                var th = _th_.cloneNode(false);
                th.appendChild(document.createTextNode(key));
                tr.appendChild(th);
            }
        }
    }
    table.appendChild(tr);
    return columnSet;
}

// Vars
var _table_ = document.createElement('table'),
    _tr_ = document.createElement('tr'),
    _th_ = document.createElement('th'),
    _td_ = document.createElement('td');
_table_.className = "table table-bordered table-hover";
const baseURL = "http://jpl-select:8080" // CHANGE ME
var skipParam = "&skip=";
var skip = 0;
var sizeParam = "&size=";
var size = Number((document.location.search.match(/size=(\d+)/) || {1: 20})[1]);
var endpoint = "/v1/logs/last?";
var url = baseURL + endpoint + sizeParam + size + skipParam + skip;

// Window
window.addEventListener('load', function () {
    var cursoInput = document.getElementById("cursoInput");
    var turmaInput = document.getElementById("turmaInput");
    var emailInput = document.getElementById("emailInput");
    var salaInput = document.getElementById("salaInput");
    var anterior = document.getElementById("anterior");
    var proximo = document.getElementById("proximo");
    var csvData = document.getElementById("csvdatefrom");
    var csvTimestamp = document.getElementById("csvtimestamp");
    var csvBaixar = document.getElementById("csvsubmit");
    var horaEntrada = document.getElementById('timestart');
    var horaSaida = document.getElementById('timeend');

    // Main page
    getData("init", url);
    // Buttons
    anterior.addEventListener("click", function (event) {
        if (skip < size) {
            skip = 0;
            alert("Pagina 1")
            url = baseURL + endpoint + sizeParam + size + skipParam + skip;
            getData(null, url);
        } else {
            skip -= size;
            url = baseURL + endpoint + sizeParam + size + skipParam + skip;
            getData(null, url);
        }
    });
    proximo.addEventListener("click", function (event) {
        skip += size;
        url = baseURL + endpoint + sizeParam + size + skipParam + skip;
        getData(null, url);
    });
    // Search
    cursoInput.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            endpoint = "/v1/logs/course?id=" + cursoInput.value;
            skip = 0;
            url = baseURL + endpoint + sizeParam + size + skipParam + skip;
            event.preventDefault();
            document.getElementById("headRegistros").innerHTML = "Registros encontrados";
            getData("curso", url);
        }
    });
    turmaInput.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            endpoint = "/v1/logs/class?id=" + turmaInput.value;
            skip = 0;
            url = baseURL + endpoint + sizeParam + size + skipParam + skip;
            event.preventDefault();
            document.getElementById("headRegistros").innerHTML = "Registros encontrados";
            getData("turma", url);
        }
    });
    emailInput.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            endpoint = "/v1/logs/student?email=" + emailInput.value;
            skip = 0;
            url = baseURL + endpoint + sizeParam + size + skipParam + skip;
            event.preventDefault();
            document.getElementById("headRegistros").innerHTML = "Registros encontrados";
            getData("email", url);
        }
    });
    salaInput.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            endpoint = "/v1/logs/room?id=" + salaInput.value;
            skip = 0;
            url = baseURL + endpoint + sizeParam + size + skipParam + skip;
            event.preventDefault();
            document.getElementById("headRegistros").innerHTML = "Registros encontrados";
            getData("sala", url);
        }
    });

    csvData.addEventListener('change', function(_) {
        csvTimestamp.value = (csvData.valueAsDate || new Date(0)).toISOString();
    });

    csvBaixar.addEventListener('click', function(_) {
        var ts = csvTimestamp.value,
            curso = cursoInput.value,
            turma = turmaInput.value,
            email = emailInput.value,
            sala = salaInput.value,
            t0 = horaEntrada.valueAsNumber || '',
            t1 = horaSaida.valueAsNumber || '';

        var dados = {ts, curso, turma, email, sala, t0, t1},
            queryParams = [];
        var url = `${baseURL}/v1/csv?`;

        for (var dado in dados) {
            queryParams.push(`${dado}=${dados[dado]}`);
        }
        url += queryParams.join('&');

        console.log("click no botão de baixar csv");
        console.log(url);

        window.open(url);
    });
});
