// Referencias a los botones
const countryBtn = document.getElementById('countryBtn');
const cityBtn = document.getElementById('cityBtn');
const countryLanguageBtn = document.getElementById('countryLanguageBtn');
const searchCountryBtn = document.getElementById('searchCountryBtn');

// Referencias a la tabla
const recordsTable = document.getElementById('records');

// Limpiar los registros
function clearRecords() {
    recordsTable.innerHTML = '';
}

// Buscar país por nombre y mostrar los registros de las tres tablas relacionadas
searchCountryBtn.addEventListener('click', () => {
    const countryName = prompt("Ingresa el nombre del país que deseas buscar:");
    if (!countryName) {
        alert("Debes ingresar un nombre de país.");
        return;
    }

    clearRecords();
    axios.get(`//3.85.4.237/getRecords.php?search=${encodeURIComponent(countryName)}`)
        .then(response => {
            const data = response.data;
            console.log(data);
            populateTable(data.city, ['ID', 'Name', 'CountryCode', 'District', 'Population'], 'Ciudades');
            populateTable(data.countrylanguage, ['CountryCode', 'Language', 'IsOfficial', 'Percentage'], 'Idiomas');
            populateTable(data.country, ['Code', 'Name', 'Continent', 'Region', 'Population'], 'Países');
        })
        .catch(error => {
            console.error(error);
        });
});

// Mostrar registros de la tabla "country"
countryBtn.addEventListener('click', async () => {
    clearRecords();
    try {
        // Paso 1: Llama a index.php para obtener el código de país basado en la IP
        const ipResponse = await axios.get('//3.85.4.237/geolocation/index.php');
        const countryCode3 = ipResponse.data.country_code3;

        console.log('Código de país obtenido:', countryCode3); // Verifica el código de país

        if (countryCode3) {
            // Paso 2: Usa el código de país obtenido en la solicitud a getRecords.php
            const response = await axios.get(`//3.85.4.237/geolocation/getRecords.php?table=country&country_code3=${countryCode3}`);
            console.log('Respuesta de países filtrada:', response.data);  // Verifica la estructura de los datos en la consola

            // Poblamos la tabla solo con los registros filtrados
            const data = Array.isArray(response.data) ? response.data : [];
            // Poblamos la tabla solo con los registros filtrados
            if (data.length > 0) {
                populateTable(data, ['Code', 'Name', 'Continent', 'Region', 'Population'], 'Países');
            } else {
                alert("No se encontraron registros para el país correspondiente.");
            }
        } else {
            console.error("El country_code3 no está definido.");
        }
    } catch (error) {
        console.error("Error al obtener los datos de países filtrados:", error);
    }
});

// Mostrar registros de la tabla "city"
cityBtn.addEventListener('click', () => {
    clearRecords();
    axios.get('//3.85.4.237/getRecords.php?table=city')
        .then(response => {
            console.log(response.data);
            const data = Array.isArray(response.data) ? response.data : response.data.city || [];
            populateTable(data, ['ID', 'Name', 'CountryCode', 'District', 'Population'], 'Ciudades');
        })
        .catch(error => {
            console.error(error);
        });
});

// Mostrar registros de la tabla "countrylanguage"
countryLanguageBtn.addEventListener('click', () => {
    clearRecords();
    axios.get('//3.85.4.237/getRecords.php?table=countrylanguage')
        .then(response => {
            console.log(response.data);
            const data = Array.isArray(response.data) ? response.data : response.data.countrylanguage || [];
            populateTable(data, ['CountryCode', 'Language', 'IsOfficial', 'Percentage'], 'Lenguajes por País');
        })
        .catch(error => {
            console.error(error);
        });
});

// Función para poblar la tabla con datos
function populateTable(data, columns, tableTitle = '') {
    // Limpiar el contenido anterior del cuerpo de la tabla
    recordsTable.innerHTML = '';
    if (tableTitle) {
        const titleRow = document.createElement('tr');
        const titleCell = document.createElement('td');
        titleCell.colSpan = columns.length;
        titleCell.innerHTML = `<strong>${tableTitle}</strong>`;
        recordsTable.appendChild(titleRow);
        titleRow.appendChild(titleCell);
    }
    // Crear fila de encabezados
    const headerRow = document.createElement('tr');
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
    });
    recordsTable.appendChild(headerRow);
    // Insertar los datos en la tabla
    data.forEach(item => {
        const row = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = item[col] !== undefined ? item[col] : '';  // Verifica si el valor existe
            row.appendChild(td);
        });
        recordsTable.appendChild(row);
    });
}