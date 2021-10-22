/**
 * создает канвас
 */
function create_canvas() {
    var canvas_html = document.createElement('canvas');
    canvas_html.id = "canvas";
    canvas_html.width = 1500;
    canvas_html.height = 800;

    document.body.appendChild(canvas_html);

    return canvas_html.getContext('2d');
}

/**
 * рисует координатные оси  
 */
function drawCoordLines() {
    canvas.beginPath();
    canvas.moveTo(300, 10);
    canvas.lineTo(300, 400);
    canvas.moveTo(10, 220);
    canvas.lineTo(600, 220);
    canvas.stroke();
    canvas.closePath();
}

/**
 * рисует оболочку
 */
function drawHull() {
    canvas.beginPath();
    canvas.moveTo(300 + points[ h[0] ].x, 220 - points[ h[0] ].y);
    for(var i=1; i<h.length; i++){
        canvas.lineTo(300 + points[ h[i] ].x, 220 - points[ h[i] ].y);
    }
    
    canvas.closePath();    
    canvas.stroke();    
}

/**
 * рисует точки
 */
function drawPoints() {
    
    canvas.fillStyle = '#00f';
    for(var i=0; i<points.length; i++){
        canvas.beginPath();
        canvas.arc(300 + points[i].x, 220 - points[i].y, 3, 0, Math.PI * 2); // рисует точку
        canvas.closePath();
        canvas.fill(); 
    }    
    

}

/**
 * обновляет и перерисовывает канвас
 */
function update() {
    canvas.clearRect(0, 0, 1500, 800); // очищаем канвас
    drawCoordLines();    
    drawHull();
    drawPoints();
}

/**
 * считывает точки из формы
 */
function getPoints() {
    // получаем строку введенную в форму, и записываем в массив, разбив ее по запятой
    var coords = pointsV.value.split(", ");
    var i = 0;
    var j = 0;
    points = [];
    ch = [];
    while (i < coords.length) {
        points[j++] = {
            'x': parseInt(coords[i++]),
            'y': parseInt(coords[i++])
        }
        ch.push(j-1);
    }    
    graham();
}

/**
 * возращает векторное произведение
 */
function classify(vector, x1, y1) {
    return pr = (vector.x2 - vector.x1) * (y1 - vector.y1) - (vector.y2 - vector.y1) * (x1 - vector.x1);
}

/**
 * Выполняет поиск Грэхема и заполняет массив h, в котором будут перечислены точки, входящие в оболочку
 */
async  function graham ()  {
    var minI = 0; //номер нижней левой точки
    var min = points[0].x;
    // ищем нижнюю левую точку
    for (var i = 1; i < points.length; i++) {
        if (points[i].x < min) {
            min = points[i].x;
            minI = i;
        }
    }
    // делаем нижнюю левую точку активной
    ch[0] = minI;
    ch[minI] = 0;

    // сортируем вершины в порядке "левизны"
    for (var i = 1; i < ch.length - 1; i++) {
        for (var j = i + 1; j < ch.length; j++) {
            var cl = classify({
                'x1': points[ ch[0] ].x,
                'y1': points[ ch[0] ].y,
                'x2': points[ ch[i] ].x,
                'y2': points[ ch[i] ].y
            }, points[ ch[j] ].x, points[ ch[j] ].y) // функция classify считает векторное произведение.            

            // если векторное произведение меньше 0, следовательно вершина j левее вершины i.Меняем их местами
            if (cl < 0) {
                temp = ch[i];
                ch[i] = ch[j];
                ch[j] = temp;
            }
        }
    }   

    //записываем в стек вершины, которые точно входят в оболочку
    await timeout(1000)
    h = [];
    h[0] = ch[0];
    h[1] = ch[1];
    update()
    
    
    for (var i = 2; i < ch.length; i++) {

        while (classify({
            'x1': points[ h[h.length - 2] ].x,
            'y1': points[ h[h.length - 2] ].y,
            'x2': points[ h[h.length - 1] ].x,
            'y2': points[ h[h.length - 1] ].y
        }, points[ ch[i] ].x, points[ ch[i] ].y) < 0) {
            await timeout(1000)
            h.pop();
            update();
        }
        await timeout(1000)
        h.push(ch[i]); // добавляем новую точку в оболочку
        update()
    }
    
    // обновляем канвас
    // update();
}

function timeout(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {resolve(true)}, ms)
    })
}

/**
 * выполняется когда страница будет полностью загружена в браузер
 */
window.onload = function() {
    canvas = create_canvas();

    // массив точек, из которых строим выпуклую оболочку
    points = [{
            'x': 10,
            'y': 20
        }, {
            'x': 60,
            'y': 160
        }, {
            'x': 110,
            'y': 20
        }, {
            'x': -60,
            'y': 80
        },
        {
            'x': 70,
            'y': 140
        }];

    // массив номеров точек, потребуется для алгоритма Грэхема   
    ch = [0, 1, 2, 3, 4];

    // искомая оболочка, будет заполнена функцией graham
    h = []

    // получаем форму ввода
    pointsV = document.getElementById('points');
    graham();
}
