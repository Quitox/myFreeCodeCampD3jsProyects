
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
const lista = document.querySelector("section#datos > ol");

const url = "./dataMock.json" || "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

let datos, svg;
let xScale, yScale, colorScaleDiscreto;
let tempBase

/**************************************************
 * Data - Monk
***************************************************/
/* {
//     "baseTemperature": 8.66,
//     "monthlyVariance": [
//         {
//         "year": 1753,
//         "month": 1,
//         "variance": -1.366
//         },
//         ...
//     ]
// }
*/

let globales = {
    // Specify the chart’s dimensions.
    width: 900 / 1.2,
    height: 500 / 1.2,
    marginTop: 10,
    marginRight: 10,
    marginBottom: 30,
    marginLeft: 60,

    cantidad: 0,
    barWidth: 0,
    initialSpaceX: 0, //utilizado para generar un espación y no sobreescribir el eje de ordenadas.

    zonaGrafX() {
        return (this.width) - (this.marginLeft) - (this.marginRight)
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
        svg
            .append("text")
            .attr("id", "title")
            .attr("x", () => globales.width / 2 + "px")
            .attr('text-anchor', 'middle') // Centra el elemento.
            .attr("y", 6 + "%")
            .text("Título")
            .attr("style", "font-size: 1.45rem; fill: white; stroke: black;")
        svg
            .append("text")
            .attr("id", "sub-title")
            .attr("x", () => globales.width / 2 + "px")
            .attr('text-anchor', 'middle') // Centra el elemento.
            .attr("y", 11 + "%")
            .text("Sub titulo")
            .attr("style", "font-size: 1.05rem; fill: blue; text-decoration: underline")

        /**************************************************
        * Legend
        ***************************************************/
        const widthLegend = 0;
        const heightLegend = 0;
        const positionLegendX = globales.width - widthLegend - globales.width * .02
        const positionLegendY = globales.height / 2 - heightLegend / 2
        const gapLegend = 25;
        // recupera info de data cualitativa y el rango cromatico aplicado.
        // console.log(colorScale.domain())
        // console.log(colorScale.range())
        /*
                const legend = svg
                    .append("g")
                    .attr("id", "legend")
                // La posicion no se pude definir en el elemnto "g" de svg!!!
        
                // legend.append("text")
                //     .attr("id", "LegendTitle")
                //     .attr("x", positionLegendX + "px")
                //     .attr("y", positionLegendY - gapLegend * 2 + "px")
                //     .text(`Legend`)
                //     .style("color", "blue")
                //     .style("font-size", "1.40rem")
                //     .style("font-weight", "bold")
                //     .style("text-anchor", "end")
                //     .style("font-style", "italic")
        
                // svg.selectAll(".dotsLegend")
                //     .data(colorScale.domain())
                //     .enter()
                //     .append("circle")
                //     .attr("class", "dotsLegend")
                //     .attr("cx", () => positionLegendX)
                //     .attr("cy", (d, i) => positionLegendY - gapLegend * i)
                //     .attr("r", 7)
                //     .style("fill", function (d) { return colorScale(d) })
        
                // svg.selectAll("labelLegend")
                //     .data(colorScale.domain())
                //     .enter()
                //     .append("text")
                //     .attr("class", "labelLegend")
                //     .attr("x", positionLegendX - 10)
                //     .attr("y", (d, i) => positionLegendY + 6 - (gapLegend) * i)
                //     .text(d => d ? "Doping Positive" : "Doping Negative")
                //     .style("text-anchor", "end")
                // // .style("font-style", "italic")
        */

    } catch (error) {
        alert("Error: " + error)
    }
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
    svg.append("g")
        .attr("transform", `translate(0,${globales.height - globales.marginBottom})`)
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
        .range([globales.marginBottom, (globales.height - globales.marginBottom)])

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

    // Add the x-axis.
    svg.append("g")
        .attr("transform", `translate(${globales.marginLeft - globales.initialSpaceX},0)`)
        .style("fill", `white`)
        .attr("id", "y-axis")
        .call(yAxis)

    /************************************
     * Color => Temperarute
    *************************************/

    // colorScaleDiscreto
    const temp_min = d3.min(datos, d => (d.variance + tempBase))
    const temp_max = d3.max(datos, d => (d.variance + tempBase))

    const cantidadColores = 16

    const tempSegmentosRange = (temp_min + temp_max) / cantidadColores

    // console.log(tempSegmentosRange)

    const tempDominio = []
    const tempRange = []
    let i = temp_min
    const rangoMedio = .02
    while (i <= temp_max) { //se ejecuta si es true
        tempDominio.push(i)

        //Quise combinar 2 timpos de rangos de color... y un intermedio
        let color;
        if (i < (tempBase / (1 + rangoMedio))) {
            color = d3.interpolateCool((i / cantidadColores))
        } else if ((i >= (tempBase / (1 + rangoMedio))) && (i <= (tempBase * (1 + rangoMedio)))) {
            color = "yellow"
        } else if (i > (tempBase * (1 + rangoMedio))) {
            color = d3.interpolateOranges((i / cantidadColores))
        }

        tempRange.push(color)

        i += tempSegmentosRange
    }

    console.log(tempDominio)
    console.log(tempRange)
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
}

function creatTooltip(contenedor) {
    return d3.select(contenedor)
        .append("rect")
        .attr("id", "tooltip")
        .attr("data-year", "")
        .style("background", "black")


}
//inicia tooltip
const tooltip = creatTooltip("#grafico-contenedor");

function createRectangulos(datos) {

    // console.log(datos)
    globales.rect.arrYears = new Set(datos.map((x) => x.year))

    globales.rect.cantidadHorizontal = d3.max([...globales.rect.arrYears], (d) => d) - d3.min([...globales.rect.arrYears], (d) => d)

    //globales.ract.cantidadVertical = (globales.cantidad/12)

    globales.rect.width = globales.zonaGrafX() / globales.rect.cantidadHorizontal

    //mejorar formula
    globales.rect.height = (globales.zonaGrafY() - 20) / 12

    const rectGroup = svg.append("g").attr("id", "GrupoRectangulos")

    const rect = rectGroup.selectAll("rect")
        .data(datos)
        .enter()
        .append("rect")
        .attr("class", "rect cell")
        .attr("data-month", d => d.month)
        .attr("data-year", d => d.year)
        .attr("data-temp", d => d.variance + tempBase)
        .attr("class", "rect")
        .attr("width", globales.rect.width)
        .attr("height", globales.rect.height)
        .attr("x", d => xScale(d.year))
        .attr("y", (d, i) => {
            // console.log(d.month)
            return (globales.rect.height * (d.month)) - globales.marginTop + 10
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