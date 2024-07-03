
/*Info ezterna consultada
        // temas interesante ... eliminar repetidos:
        // https://matiashernandez.dev/blog/post/4-formas-de-eliminar-elementos-duplicados-en-un-arreglo-con-javascript

        // Buen resumen sobre Date()
        // https://es.javascript.info/date#date-parse-a-partir-de-un-string
*/

const lista = document.querySelector("section#datos > ol");

const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

const graficar = (dataset) => {
    try {

        /**************************************************
         * Data - Monk
        ***************************************************/
        // console.log(dataset)
        // Object { Time: "36:50", Place: 1, Seconds: 2210, … }
        // Doping: "Alleged drug use during 1995 due to high hematocrit levels"
        // Name: "Marco Pantani"
        // Nationality: "ITA"
        // Place: 1
        // Seconds: 2210
        // Time: "36:50"
        // URL: "https://en.wikipedia.org/wiki/Marco_Pantani#Alleged_drug_use"
        // Year: 1995


        /**************************************************
         * Graphyc dimentions
        ***************************************************/

        // Specify the chart’s dimensions.
        const width = 900 / 1.2;
        const height = 500 / 1.2;
        const marginTop = 50;
        const marginRight = 100;
        const marginBottom = 30;
        const marginLeft = 50 + 10;
        const cantidad = dataset.length;
        const zonaGrafX = width - marginLeft - marginRight;
        const zonaGrafY = height - marginBottom - marginTop;
        const barWidth = (zonaGrafX - marginLeft) / cantidad;
        const initialSpaceX = 1; //utilizado para generar un espación y no sobreescribir el eje de ordenadas.


        /**************************************************
        * SVG Element
        ***************************************************/

        // Add a SVG element
        const svg = d3.select("#grafico-contenedor")
            .append("svg")
            .attr("id", "grafico-svg")
            .attr("width", width)
            .attr("height", height)
            .style("background", "#ddd");


        /**************************************************
         * Scale - Max/Min
        ***************************************************/
        // Year
        const years = dataset.map(x => x.Year)

        const x_min = d3.min(dataset, d => d.Year - initialSpaceX);
        // console.log(x_min);
        const x_max = d3.max(dataset, d => d.Year)
        // console.log(typeof x_max);

        // Time
        const times = dataset.map(x => {
            const hh = Number(x.Time.split(":")[0])
            const mm = Number(x.Time.split(":")[1])
            const fecha = new Date("01-01-2000 00:" + hh + ":" + mm)
            const TimeMM = ((hh * 60) + mm);
            return { "Time": x.Time, TimeMM, fecha };
        }); //console.log(times);

        const y_min = d3.min(times, d => d.fecha);
        // console.log(y_min);
        const y_max = d3.max(times, d => d.fecha);
        // console.log(y_max);

        /**************************************************
         * Scale - Generation
        ***************************************************/

        // X => Years
        const xScale = d3.scaleLinear()
            .domain([x_min, x_max])  //Raw info
            .range([marginLeft, zonaGrafX]) //Pixels

        // X => Min:Seg
        const yScale = d3.scaleTime()
            .domain([y_min, y_max])
            .range([marginBottom, (height - marginBottom)]); // Pixels

        // Colors => Doping
        const dopingInfo = dataset.map(d => (d.Doping === "" ? false : true));
        const colorScale = d3.scaleOrdinal()
            .domain(dopingInfo) //.domain de D3 elimina los repetidos del array
            .range(d3.schemeCategory10)

        /**************************************************
         * Axis
        ***************************************************/
        // Add the x-axis.
        const formatYear = d3.utcFormat("%Y"); //devuelve un string

        const xAxis = d3.axisBottom()
            .scale(xScale)
            .tickFormat(d3.format('d')) // IMPOTANT Precision is ignored for integer formats (types b, o, d, x, and X) and character data (type c).
        // .tickFormat(formatYear);

        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .style("fill", `white`)
            .attr("id", "x-axis")
            .call(xAxis)

        // Add the y-axis.
        const formatTime = d3.timeFormat("%M:%S"); //devuelve un string

        //crea el Eje Y
        const yAxis = d3.axisLeft(yScale).tickFormat(formatTime); //util para la estetica

        svg.append("g")
            .attr("transform", `translate(${marginLeft}, 0)`)
            .style("fill", `white`)
            .attr("id", "y-axis")
            .call(yAxis) // pinta el Eje Y

        /**************************************************
         * Dots
        ***************************************************/

        // Data - SVG Group of circle element     
        const dotsGroup = svg.append("g").attr("id", "dotsGroup")

        // Data - circle element
        const dots = dotsGroup.selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("class", "svg-dot dot")
            // Meta data
            .attr("data-name", (d) => d.Name)
            .attr("data-nationality", (d) => d.Nationality)
            .attr("data-xvalue", (d) => new Date("01 - 01 - " + d.Year))
            .attr("data-yvalue", (d) => new Date(`01 - 01 - 1970 00:${d.Time}`))
            // Ubic X => En circle elemente es "cx"
            .attr("cx", (d, i) => marginLeft + xScale(d.Year) - marginLeft)
            // Ubic Y => En circle elemente es "cy"
            .attr("cy", (d, i) => yScale(times[i].fecha))
            .attr("r", 5)
            .attr("fill", (d, i) => colorScale(dopingInfo[i]))

        /**************************************************
         * Dots / Tooltip - Events   [NO USO]
        ***************************************************/
        d3.selectAll(".dot")
            .on("mouseenter", function (event, d) {
                //d3.mouse(this)[0] <= obsoleto
                //(event.pageX)
                const x = Number(this.attributes[5].value) + 5;
                const y = d3.pointer(event)[1] + 15;

                tooltip
                    .attr("data-year", new Date("01 - 01 - " + d.Year))
                    .html(`<p><strong>Atleta</strong>: <em>${d.Name}</em></p>
                            <p style="font-style : italic; text-align : center ">Time:${d.Time} | Year:${d.Year}</p>`)
                    .style("top", y + "px")
                    .style("left", x + "px")
                    .style("opacity", 1);
            })
            .on("mouseleave", function () {
                tooltip
                    .style("opacity", 0)
            })

        // El problema que se prensetó con los metodos se devio a ejecutar una version obsoleta de D3js
        // Un problema IMPORTANTE ... Se disparaban simultaneamente lo eventos "mouseenter" y "mouseleave"... Problema es que TOOLTIP apaecia sobre el elemnto que tenia los eventos y entonces se disparaba el mouseleave... Al correr el TOOLTIP ya no se disparaban erroneamente.

        /**************************************************
         * Tooltip
        ***************************************************/
        // Agrega un div dentro de #grafico-contenedor despues del elemento SVG  

        var tooltip = d3
            .select("#grafico-contenedor")
            .append("div")
            .attr("id", "tooltip") //id css => #tooltip 
            .style("opacity", 0) //Invisible
            .style("background-color", "white")
            // .style("border", "solid")
            // .style("border-width", "2px")
            // .style("border-radius", "5px")
            // .style("padding", "5px")
            .style("z-index", "10000")
            .style("position", "absolute")
            .style("transition", "opacity 0.25s")
        // .style("top", (height * .1) + "px")
        // .style("left", (width * .1) + "px")

        /**************************************************
        * Titulo
        ***************************************************/
        svg
            .append("text")
            .attr("id", "title")
            .attr("x", () => width / 2 + "px")
            .attr('text-anchor', 'middle') // Centra el elemento.
            .attr("y", 6 + "%")
            .text("Doping in Professional Bicycle Racing")
            .attr("style", "font-size: 1.45rem; fill: white; stroke: black;")
        svg
            .append("text")
            .attr("id", "sub-title")
            .attr("x", () => width / 2 + "px")
            .attr('text-anchor', 'middle') // Centra el elemento.
            .attr("y", 11 + "%")
            .text("35 Fastest times up Alpe d'Huez")
            .attr("style", "font-size: 1.05rem; fill: blue; text-decoration: underline")

        /**************************************************
        * Legend
        ***************************************************/
        const widthLegend = 0;
        const heightLegend = 0;
        const positionLegendX = width - widthLegend - width * .02
        const positionLegendY = height / 2 - heightLegend / 2
        const gapLegend = 25;
        // recupera info de data cualitativa y el rango cromatico aplicado.
        // console.log(colorScale.domain())
        // console.log(colorScale.range())

        const legend = svg
            .append("g")
            .attr("id", "legend")
        // La posicion no se pude definir en el elemnto "g" de svg!!!

        legend.append("text")
            .attr("id", "LegendTitle")
            .attr("x", positionLegendX + "px")
            .attr("y", positionLegendY - gapLegend * 2 + "px")
            .text(`Legend`)
            .style("color", "blue")
            .style("font-size", "1.40rem")
            .style("font-weight", "bold")
            .style("text-anchor", "end")
            .style("font-style", "italic")

        svg.selectAll(".dotsLegend")
            .data(colorScale.domain())
            .enter()
            .append("circle")
            .attr("class", "dotsLegend")
            .attr("cx", () => positionLegendX)
            .attr("cy", (d, i) => positionLegendY - gapLegend * i)
            .attr("r", 7)
            .style("fill", function (d) { return colorScale(d) })

        svg.selectAll("labelLegend")
            .data(colorScale.domain())
            .enter()
            .append("text")
            .attr("class", "labelLegend")
            .attr("x", positionLegendX - 10)
            .attr("y", (d, i) => positionLegendY + 6 - (gapLegend) * i)
            .text(d => d ? "Doping Positive" : "Doping Negative")
            .style("text-anchor", "end")
        // .style("font-style", "italic")


    } catch (error) {
        alert("Error: " + error)
    }
}

function inicio(url) {

    fetch(url)
        .then(datos => datos.json())
        .then(jsonData => {
            const datos = jsonData;

            datos.forEach((x, i) => {
                const style = (i % 2 === 0) ? "" : "background: grey; color: blue";
                lista.innerHTML += `<li style="${style}">${x.Nationality} | Lugar: ${x.Place} | Nombre: ${x.Name} | ${x.Time}</li>`;

            });

            graficar(datos);

        }).catch((err) => console.log(err))

}

console.log("D3js version " + d3.version)
inicio(url);