
/*Info ezterna consultada
// temas interesante ... eliminar repetidos:
// https://matiashernandez.dev/blog/post/4-formas-de-eliminar-elementos-duplicados-en-un-arreglo-con-javascript

// Buen resumen sobre Date()
// https://es.javascript.info/date#date-parse-a-partir-de-un-string
*/


//GLOBALES
/**************************************************
 * Variables Globales
***************************************************/

const urlCounties = "./dataCountiesMock.json" || "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

const urlEducation = "./dataEducationMock.json" || "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

let datos, svg, tooltip;
let xScale, yScale, colorScaleDiscreto;
let tempBase

/**************************************************
 * Data - Monk
***************************************************/

/* urlEducation
    {
       {
        "fips": 1001,
        "state": "AL",
        "area_name": "Autauga County",
        "bachelorsOrHigher": 21.9
        },
        ...
    }
*/

/*urlCounties
{
    "type": "Topology",
    objects : {
        counties: {
            "type": "GeometryCollection",
            "geometries": [
                {
                    "type": "Polygon",
                    "id": 5089,
                    "arcs": [
                        [
                            0,
                            1,
                            2,
                            3,
                            4
                        ]
                    ]
                },
        }
        states:{
            "type": "GeometryCollection",
            "geometries": [
                {
                    "type": "MultiPolygon",
                    "arcs": [
                        [
                            [
                                2311,
                                ...,
                                -2375
                            ]
                        ]
                    ],
                    "id": "05"
                },
        }
        nation: {
            "type": "GeometryCollection",
            "geometries": [
                {
                    "type": "MultiPolygon",
                    "arcs": [
                        [
                            [
                                9206,
                                ...,
                                864
                            ]   
                        ],
                        ...,
                    ]
                }   
            ]
        }
    },
    arcs:[],
    bbox:[],
    "transform": {
        "scale": [
            0.009995801851947097,
            0.005844667153098606
        ],
        "translate": [
            -56.77775821661018,
            12.469025989284091
        ]
    }
}
*/


let globales = {
    // Specify the chart’s dimensions.
    width: 900 / 1.2,
    height: 500 / 1.2,
    marginTop: 40,
    marginRight: 0,
    marginBottom: 60,
    marginLeft: 60,

    cantidad: 0,
    barWidth: 0,
    initialSpaceX: 0, //utilizado para generar un espación y no sobreescribir el eje de ordenadas.

    zonaGrafX() {
        return (this.width) - (this.marginLeft)
    },
    zonaGrafY() {
        return this.height - this.marginBottom - this.marginTop
    },
    rect: {
        y_rawData: 0,
        cantidadHorizontal: 0,
        width: 0,
        height: 0,
    }
}

// console.log(globales.zonaGrafY())

const graficar = (dataset) => {
    try {

        tempBase = dataset.baseTemperature;
        const datasetMonthly = dataset.monthlyVariance; // array

        const where = document.querySelector("#grafico-contenedor")
        tooltip = creatTooltip(where);
        svg = crearGraficoSVG(where)
        crearEscalas(datasetMonthly)

        /**************************************************
         * Graphyc dimentions
        ***************************************************/

        // cantidad horizontal no funciona.
        globales.cantidad = datasetMonthly.length;
        globales.barWidth = (globales.zonaGrafX() - globales.marginLeft) / globales.cantidad;


        /**************************************************
         * Rectangulos
        ***************************************************/
        createRectangulos(datasetMonthly)

        /**************************************************
        * Titulo
        ***************************************************/
        //los años y la temp base se podrian haber agregado dinamicamente.
        const text = { title: "Monthly Global Land-Surface Temperature", subtitle: `1753 - 2015: base temperature ${tempBase}℃` }
        createTitle(text)

    } catch (error) {
        alert("Error: " + error)
    }
}


function createTitle({ title, subtitle }) {

    const titlesGroup = svg.append("g")
        .attr("id", "titlesGroupe")

    titlesGroup
        .append("text")
        .attr("id", "title")
        .attr("x", () => globales.width / 2 + "px")
        .attr('text-anchor', 'middle') // Centra el elemento.
        .attr("y", 6 + "%")
        .text(title)
        .attr("style", "font-size: 1.45rem; fill: white; stroke: black;")
    titlesGroup
        .append("text")
        .attr("id", "sub-title")
        .attr("x", () => globales.width / 2 + "px")
        .attr('text-anchor', 'middle') // Centra el elemento.
        .attr("y", 11 + "%")
        .text(subtitle)
        .attr("style", "font-size: 1.05rem; fill: blue; text-decoration: underline")


}

function crearGraficoSVG(elContenedor) {
    // Create SVG Element
    const svg = d3.select(elContenedor)
        .append("svg")
        .attr("id", "grafico-svg")
        .attr("width", globales.width)
        .attr("height", globales.height)
        .style("background", "#ddd");
    return svg
}

function crearEscalas(datos) {
    // console.log(datos)

    const axisGroup = svg.append("g")
        .attr("id", "axisGroup")

    /************************************
     * X => Years
    *************************************/

    // Scale - Generation
    xScale = d3.scaleLinear()
        .domain([d3.min(datos, d => d.year), d3.max(datos, d => d.year)])  //Raw info
        .range([globales.marginLeft, globales.zonaGrafX()]) //Pixels

    // Create the x-axis.
    const xAxis = d3.axisBottom()
        .scale(xScale)
        .tickFormat(d3.format('d')) // IMPOTANT Precision is ignored for integer formats (types b, o, d, x, and X) and character data (type c).

    // Add the x-axis.
    axisGroup.append("g")
        .attr("transform", `translate(1,${globales.height - globales.marginBottom - globales.marginTop + 2})`)
        .style("fill", `white`)
        .attr("id", "x-axis")
        .call(xAxis)


    /************************************
     * Y => Month
    *************************************/

    // Scale - Generation
    /*El objeto global Set
     es una estructura de datos, una colección de valores que permite sólo almacenar valores únicos de cualquier tipo, incluso valores primitivos u referencias a objetos.
    
    */
    const y_rawData = new Set(datos.map(x => x.month))

    /* Band scales
    are convenient for charts with an ordinal or categorical dimension.
    //https://observablehq.com/@d3/d3-scaleband
    */
    const yScale = d3.scaleBand()
        .domain([...y_rawData])
        .range([globales.marginBottom, (globales.zonaGrafY())])

    // Create the y-axis.
    const yAxis = d3.axisLeft()
        .scale(yScale)
        .tickValues([...y_rawData])
        .tickFormat((d, i) => {
            const fecha = new Date();
            fecha.setMonth(d - 1)

            const format = new Intl.DateTimeFormat("en-US", { month: "long" }).format(fecha)
            return format;
        })

    // Add the y-axis.
    axisGroup.append("g")
        .attr("transform", `translate(${globales.marginLeft - globales.initialSpaceX},2)`)
        .style("fill", `white`)
        .attr("id", "y-axis")
        .call(yAxis)

    /************************************
     * Color => Temperarute
     * ERRORES EN LA ESCALA-... si se complica mucho simplificar. Capaz Range a mano. 
    *************************************/

    // colorScaleDiscreto

    const temp_min = d3.min(datos, d => (d.variance + tempBase))
    const temp_max = d3.max(datos, d => (d.variance + tempBase))

    const cantidadColores = 15

    const tempSegmentosRange = (temp_max - temp_min) / cantidadColores
    // console.log(temp_max, temp_min, temp_max - temp_min)
    // console.log(tempSegmentosRange)

    // Arma una escala combinada
    let i = temp_min
    const tempDominio = []
    const tempRange = []
    const rangoMedio = .00
    // let contador = 0 // usar con el console.log
    let rojo = 0 // incrementa el rojo un poco.
    while (i <= temp_max) { //se ejecuta si es true
        tempDominio.push(i)

        //Quise combinar 2 timpos de rangos de color... y un intermedio
        let color;

        if (i < (tempBase / (1 + rangoMedio))) {
            color = d3.interpolateBlues(((i) / (cantidadColores / 2)))
            tempRange.unshift(color)
            // tempRange.unshift(color)
        } else if ((i >= (tempBase / (1 + rangoMedio))) && (i <= (tempBase * (1 + rangoMedio)))) {
            color = "white"
            tempRange.push(color)
        } else {
            rojo++
            color = d3.interpolateOranges((((i + rojo) / 3) / (cantidadColores / 2)))
            tempRange.push(color)
        }

        // contador++
        // console.log(contador, i, (i / (cantidadColores / 2)), color)

        i += tempSegmentosRange
    }

    // console.log(tempDominio)
    // console.log(tempRange)

    /* Threshold scalesare similar to quantize scales, except they allow you to map arbitrary subsets of the domain to discrete values in the range. The input domain is still continuous,and divided into slices based on a set of threshold values. 
    https://d3js.org/d3-scale/threshold
    */
    // console.log(d3.schemeCategory10)
    // console.log(d3.interpolateRainbow(500)) ciclical
    // console.log(d3.interpolateOranges(x)) x= entre 0 y 1
    colorScaleDiscreto = d3.scaleThreshold()
        .domain([...tempDominio])
        .range(tempRange)
    // // Ejemplo
    // console.log(colorScaleDiscreto(-1))
    // console.log(colorScaleDiscreto(0))
    // console.log(colorScaleDiscreto(2.5))
    // console.log(colorScaleDiscreto(5))
    // console.log(colorScaleDiscreto(7.5))
    // console.log(colorScaleDiscreto(10))
    // console.log(colorScaleDiscreto(15))

    /* // colorScaleContinuo - No uso
    colorScaleContinuo = d3.scaleLinear()
        .domain([0, 10])
        .range(["blue", "red"])
    // Ejemplo
    console.log(colorScaleContinuo(-1))
    console.log(colorScaleContinuo(0))
    console.log(colorScaleContinuo(2.5))
    console.log(colorScaleContinuo(5))
    console.log(colorScaleContinuo(7.5))
    console.log(colorScaleContinuo(10))
    console.log(colorScaleContinuo(15))
    */

    /**************************************************
    * Legend
    ***************************************************/
    CreateLegend(tempDominio)

}

function CreateLegend(tempDominio) {
    // console.log(tempDominio.length)

    const LegendGroup = svg.append("g").attr("id", "legend")


    const colorBarGroup = LegendGroup.append("g").attr("id", "colorBarLegend")
    const linesGroup = LegendGroup.append("g").attr("id", "linesLegend")
    const numbersGroup = LegendGroup.append("g").attr("id", "numbersLegend")

    // Legend - Barra de colores
    colorBarGroup.selectAll("rect")
        .data(tempDominio)
        .enter()
        .append("rect")
        .attr("class", "legendRect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("x", (d, i) => (globales.width / 2) - (20 * tempDominio.length / 2) + 20 * i)
        .attr("y", globales.height - globales.marginBottom / 2)
        .attr("fill", d => colorScaleDiscreto(d))
        .attr("strock", 1)
    // .html((d, i) => { return `<strong>-${(i + 1)}-</strong>` }) // error aparece en DOM... No en pantalla

    // Legend - Linea estética
    linesGroup.append("circle")
        .attr("r", 20)
        .attr("cx", (globales.width / 2))
        .attr("cy", globales.height - 0)
        .attr("fill", "black")
    linesGroup.append("line")
        .attr("x1", (globales.width / 2) - (20 * tempDominio.length / 2) - 20)
        .attr("x2", (globales.width / 2) - (20 * tempDominio.length / 2) + 20 * tempDominio.length + 20)
        .attr("y1", globales.height - 5)
        .attr("y2", globales.height - 5)
        .attr("style", "stroke:black; stroke-width:10")
    linesGroup.append("circle")
        .attr("r", 15)
        .attr("cx", (globales.width / 2))
        .attr("cy", globales.height - 0)
        .attr("fill", "white")

    // Legend - Valores de los Grados °C
    numbersGroup.selectAll("text")
        .data(tempDominio)
        .enter()
        .append("text")
        .text(d => Number.parseFloat(d).toFixed(1))
        .attr("x", (d, i) => {
            const espaciado = 1
            return (globales.width / 2) - ((20 + espaciado) * tempDominio.length / 2) + (20 + espaciado) * i
        })
        .attr("y", globales.height - globales.marginBottom / 2 - 5)
        .attr("class", "numbersLegend")

    numbersGroup.append("text").text("°C")
        .attr("x", ((globales.width / 2) - (tempDominio.length / 2) * 20) - 30)
        .attr("y", globales.height - globales.marginBottom / 2 - 5)
        .attr("id", "medidaLegend")
}

function creatTooltip(contenedor) {
    return d3.select(contenedor)
        .append("rect")
        .attr("id", "tooltip")
        .attr("data-year", "")
        .style("background", "black")


}

function createRectangulos(datos) {

    // console.log(datos)
    globales.rect.arrYears = new Set(datos.map((x) => x.year))

    globales.rect.cantidadHorizontal = d3.max([...globales.rect.arrYears], (d) => d) - d3.min([...globales.rect.arrYears], (d) => d)

    //globales.ract.cantidadVertical = (globales.cantidad/12)

    globales.rect.width = globales.zonaGrafX() / globales.rect.cantidadHorizontal

    //mejorar formula
    globales.rect.height = (globales.zonaGrafY() - globales.marginBottom) / 12

    const rectGroup = svg.append("g").attr("id", "description")

    const rect = rectGroup.selectAll("rect")
        .data(datos)
        .enter()
        .append("rect")
        .attr("class", "cell rect")
        .attr("data-month", d => {
            //console.log(d.month - 1)
            return d.month - 1
        })
        .attr("data-year", d => d.year)
        .attr("data-temp", d => d.variance + tempBase)
        .attr("width", globales.rect.width)
        .attr("height", globales.rect.height)
        .attr("x", d => xScale(d.year))
        .attr("y", (d, i) => {
            // console.log(d.month)
            return (globales.rect.height * (d.month) + globales.marginTop)
        })
        .attr("fill", (d, i) => {
            const temp = d.variance + tempBase
            const color = colorScaleDiscreto(temp)
            return color
        })

    rect.on("mouseenter", (e, d) => {
        // ecuperar un atrributo del objeto que recibe el evento:
        const year = e.target.attributes["data-year"].nodeValue
        const month = e.target.attributes["data-month"].nodeValue
        //El método toFixed() formatea un número usando notación de punto fijo.
        //https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
        const temp = Number.parseFloat(e.target.attributes["data-temp"].nodeValue).toFixed(2)
        const variance = Number.parseFloat(d.variance).toFixed(2)

        const x = e.target.attributes["x"].nodeValue
        const y = e.target.attributes["y"].nodeValue

        d3.select(e.target)
            .attr("class", "rect rectHover")
            .attr("fill", "black")

        tooltip
            .attr("data-year", year)
            .html(`<em>Fecha <em><span>${year} / ${month}</span><hr/><em>Tempeature </em><span><strong>${temp}<em>°C</em><strong> (${variance})</span>`) //mal
            .style("color", "#fff")
            .style("top", () => ((y - 50) + "px"))
            .style("left", () => {
                // slice
                // https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/String/slice
                //console.log(tooltip._groups[0][0].style.width.slice(0, -2)) // si esta definida explicitamente la propiedad width solamente.

                const ancho = tooltip._groups[0][0].scrollWidth
                // console.log(ancho)

                return ((x - (ancho / 2)) + "px")

            })
            .style("opacity", 1)

        // console.log(tooltip)
    }).on("mouseleave", (e, d) => {
        // console.log(e.target)
        d3.select(e.target)
            .attr("class", "rect")
            .attr("fill", d => {
                const temp = d.variance + tempBase
                const color = colorScaleDiscreto(temp)
                return color
            })
        tooltip
            .text(``) //mal
            .style("opacity", 0)
    })

}

function inicio() {
    try {
        const lista = document.querySelector("section#datos > ol");

        fetch(url)
            .then(datos => datos.json())
            .then(jsonData => {
                datos = jsonData;
                // console.log(datos)

                for (let i = 0; i < 50; i++) {
                    let d = datos.monthlyVariance[i];
                    if (i > 20) {
                        lista.innerHTML += "<li>...</li>";
                        break;
                    }

                    const style = (i % 2 === 0) ? "" : "background: grey; color: blue";
                    lista.innerHTML += `<li style="${style}">${d.month} / ${d.year} | Variance: ${d.variance}</li>`;
                }

                graficar(datos);
            })

    } catch (err) {
        console.log(err)
    }

}

const d3Version = d3.version
console.log("D3js version " + d3Version)

inicio();