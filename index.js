import { dates } from './utils/dates.js'
import { POLYGON_API_KEY } from './config.js'

const tickersArr = []

const generateReportBtn = document.querySelector('.generate-report-btn')

generateReportBtn.addEventListener('click', fetchStockData)

document.getElementById('ticker-input-form').addEventListener('submit', (e) => {
    e.preventDefault()
    const tickerInput = document.getElementById('ticker-input')
    if (tickerInput.value.length > 2) {
        generateReportBtn.disabled = false
        const newTickerStr = tickerInput.value
        tickersArr.push(newTickerStr.toUpperCase())
        tickerInput.value = ''
        renderTickers()
    } else {
        const label = document.getElementsByTagName('label')[0]
        label.style.color = 'red'
        label.textContent = 'You must add at least one ticker. A ticker is a 3 letter or more code for a stock. E.g TSLA for Tesla.'
    }
})

function renderTickers() {
    const tickersDiv = document.querySelector('.ticker-choice-display')
    tickersDiv.innerHTML = ''
    tickersArr.forEach((ticker) => {
        const newTickerSpan = document.createElement('span')
        newTickerSpan.textContent = ticker
        newTickerSpan.classList.add('ticker')
        tickersDiv.appendChild(newTickerSpan)
    })
}

const loadingArea = document.querySelector('.loading-panel')
const apiMessage = document.getElementById('api-message')

async function fetchStockData() {
    if (tickersArr.length === 0) {
        const label = document.getElementsByTagName('label')[0]
        label.style.color = 'red'
        label.textContent = 'You must add at least one ticker before generating a report.'
        return
    }

    if (!POLYGON_API_KEY) {
        apiMessage.innerText = 'Missing API key. Set POLYGON_API_KEY in config.js'
        document.querySelector('.action-panel').style.display = 'none'
        loadingArea.style.display = 'flex'
        return
    }

    document.querySelector('.action-panel').style.display = 'none'
    loadingArea.style.display = 'flex'
    apiMessage.innerText = 'Querying Stocks API...'

    try {
        const results = await Promise.all(
            tickersArr.map(async (ticker) => {
                const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${POLYGON_API_KEY}`
                const response = await fetch(url)
                if (!response.ok) {
                    throw new Error(`Polygon API error for ${ticker}: ${response.status} ${response.statusText}`)
                }
                const data = await response.json()
                return { ticker, data }
            })
        )

        apiMessage.innerText = 'Creating report...'
        // For now, just stringify a summary to show success
        const summary = results
            .map(({ ticker, data }) => `${ticker}: count=${data?.results?.length ?? 0}`)
            .join(' | ')
        fetchReport(summary)
    } catch (err) {
        loadingArea.innerText = 'There was an error fetching stock data.'
        console.error('error: ', err)
    }
}

async function fetchReport(data) {
    /** AI goes here **/
}

function renderReport(output) {
    loadingArea.style.display = 'none'
    const outputArea = document.querySelector('.output-panel')
    const report = document.createElement('p')
    outputArea.appendChild(report)
    report.textContent = output
    outputArea.style.display = 'flex'
}