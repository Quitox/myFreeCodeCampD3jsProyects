
const lista = document.querySelector("section#datos > ol");

const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

const graficar = (dataset) => {
  try{
  
    /**************************************************
     * Data
    ***************************************************/

  // Specify the chart’s dimensions.
    const width = 900 / 1.2;
    const height = 500 / 1.2;
    const marginTop = 30;
    const marginRight = 0;
    const marginBottom = 30;
    const marginLeft = 50;
    const cantidad = dataset.length;
    const zonaGrafX = width - marginLeft - marginRight;
    const zonaGrafY = height - marginBottom - marginTop;
    const barWidth = (zonaGrafX - marginLeft) / cantidad;

    const x_min = new Date(d3.min(dataset, d => d[0])); //console.log(x_min);
    const x_max = new Date(d3.max(dataset, d => d[0])); //console.log(x_max);
    // console.log("   -> Y") // Montos
    const y_min = d3.min(dataset, d => d[1]); //console.log(y_min);
    const y_max = d3.max(dataset, d => d[1]); //console.log(y_max);


    /**************************************************
     * Scale
    ***************************************************/

    const xScale = d3.scaleTime()
        .domain([
            x_min,
            x_max
        ]) // Time
        .range([marginLeft, zonaGrafX]) //Pixels
    // zonaGrafX

    const yScale = d3.scaleLinear()
        .domain([
            y_max, 0
        ]) // Montos
        .range([marginBottom, (height - marginBottom)]); // Pixels

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
     * Axis
    ***************************************************/
    // Add the x-axis.
    const xAxis = d3.axisBottom().scale(xScale);

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .style("fill", `white`)
        .attr("id", "x-axis")
        .call(xAxis)

    // Add the y-axis.
    const yAxis = d3.axisLeft(yScale).ticks(20);

    svg.append("g")
        .attr("transform", `translate(${marginLeft}, 0)`)
        .style("fill", `white`)
        .attr("id", "y-axis")
        .call(yAxis)

    /**************************************************
    * Tooltip
    ***************************************************/
    // Agrega un div dentro de #grafico-contenedor despues del elemento SVG  

    var tooltip = d3.select("#grafico-contenedor")
        .append("div")
        .attr("id", "tooltip") //id css => #tooltip 
        .style("opacity", 0) //Invisible
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("z-index", "10000")
        .style("position", "absolute")
        .style("top", (height*.1)+"px")
        .style("left", (width*.1)+"px")

    /**************************************************
     * Bars
    ***************************************************/

    // Data - Bar element
    const bar = svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("class", "svg-bar bar")
        // Meta data
        .attr("data-date", (d, i) => d[0])
        .attr("data-gdp", (d, i) => d[1])
        // Ubic X y Anchura
        .attr("x", (d, i) => marginLeft + i * barWidth)
        .attr("width", barWidth)
        // Ubic y y Altura
        /* attr "y" representa la UBICACIÓN
            Se utilza a el dato de referecia Y con yScale() para referenciar el valor del dato al de la escala Y... Como la escala Y esta invertida, el dato escalado en valores pequeños da casi todo el valor de h... Lo que resulta en el valor negativo del grafico que queremos quede despejado arriba
        */
        .attr("y", (d, i) => {
            const monedaEscalada = yScale(d[1]);
            return monedaEscalada
        })
        /* attr "height" representa la altura a dibujarse la barra hacia abajo.
            Así similar al attr Y, por el tema de la escala Y invertida, al restar al Height total la altura de la barra escalada (yScale(dato)) esto genera un estacio que por negativa termina ciendo la altura de la barra.
        */
        .attr("height", (d, i) => height - marginBottom - yScale(d[1]))
        .attr("fill", "navy")

    /**************************************************
     * Bars - Events
    ***************************************************/

const mouseover = function (d) {
  //console.log(d)
            tooltip
                .attr("data-date", d[0])
                .style("opacity", 1)
                .html(`<p><strong>GDP</strong>: <span id="tip-gpd">${d[0]}</span></p><p><strong>Date</strong>: <span id="tip-date">${d[1]}</span></p>`)
        }

const mousemove = function (d) {
            tooltip
                .html(`<p><strong>GDP</strong>: <span id="tip-gpd">${d[0]}</span></p><p><strong>Date</strong>: <span id="tip-date">${d[1]}</span></p>`)
                .style("opacity", 1)
                .style("left", (xScale(new Date(this.__data__[0])) + 20) + "px")
                .style("top", (height * .8) + "px")
        }
 const mouseleave = function (d) {
            tooltip
                .style("opacity", 0)
        }

    d3.selectAll(".bar")
        //remplan a addEnventListener()
        .on("mouseover", mouseover) //hover
        .on("mousemove", mousemove) //move
        .on("mouseleave", mouseleave) //leave


    /**************************************************
     * Titulo
    ***************************************************/
    svg
        .append("text")
        .attr("x", ".7rem")
        .attr("y", "1rem")
        .attr("style", "transform: translateX(50)")
        .attr("id", "title")
        .text("Graf GDP USA 1950-2015")
        .attr("style", "fill: lightgreen; stroke: black")
  
     } catch (error) {
        alert("Error: " + error )
    }
}

function inicio(url) {

  fetch(url)
        .then(datos => datos.json())
        .then(jsonData => {

            const datos = jsonData.data;

            datos.forEach(x => {

                lista.innerHTML += `<li>Fecha: ${x[0]} | Monto: ${x[1]}</li>`;

            });

            graficar(datos);

        }).catch((err) => console.log(err))

}

inicio(url);