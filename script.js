document.addEventListener('DOMContentLoaded', function() {
    // Constants for pricing
    const BASE_COST = 1500;
    const GIT_REPO_COST = 2;
    const BUILD_PIPELINE_COST = 5;
    const RELEASE_PIPELINE_COST = 5;
    
    // Work item pricing tiers
    const WORK_ITEM_TIERS = [
        { max: 5000, cost: 1.00 },
        { max: 10000, cost: 0.80 },
        { max: 15000, cost: 0.60 },
        { max: 20000, cost: 0.40 },
        { max: Infinity, cost: 0.20 }
    ];
    
    // Excel file mapping - cell references for each input
    const EXCEL_MAPPING = {
        workItems: { row: 7, col: 'C' },
        gitRepos: { row: 18, col: 'C' },
        buildPipelines: { row: 30, col: 'C' },
        releasePipelines: { row: 31, col: 'C' },
        testPlans: { row: 32, col: 'C' },
        testCases: { row: 39, col: 'C' },
        // No mapping provided for testSuites, setting to same as testPlans
        testSuites: { row: 32, col: 'C' }
    };
    
    // Get all form elements
    const workItemsInput = document.getElementById('workItems');
    const gitReposInput = document.getElementById('gitRepos');
    const buildPipelinesInput = document.getElementById('buildPipelines');
    const releasePipelinesInput = document.getElementById('releasePipelines');
    const testPlansInput = document.getElementById('testPlans');
    const testSuitesInput = document.getElementById('testSuites');
    const testCasesInput = document.getElementById('testCases');
    const calculateBtn = document.getElementById('calculateBtn');
    
    // Get file upload elements
    const excelFileInput = document.getElementById('excelFile');
    const processExcelBtn = document.getElementById('processExcelBtn');
    const uploadStatus = document.getElementById('uploadStatus');
    
    // Get all result elements
    const baseCostEl = document.getElementById('baseCost');
    const workItemsCostEl = document.getElementById('workItemsCost');
    const gitReposCostEl = document.getElementById('gitReposCost');
    const buildPipelinesCostEl = document.getElementById('buildPipelinesCost');
    const releasePipelinesCostEl = document.getElementById('releasePipelinesCost');
    const testItemsCostEl = document.getElementById('testItemsCost');
    const totalCostEl = document.getElementById('totalCost');    // Add event listener to calculate button
    calculateBtn.addEventListener('click', calculatePrice);
    
    // Get the export button
    const exportBtn = document.getElementById('exportBtn');
    // Add event listener to export button
    exportBtn.addEventListener('click', exportToExcel);
    
    // Add event listener to process Excel button
    processExcelBtn.addEventListener('click', processExcelFile);
    
    // Function to format price to USD
    function formatPrice(price) {
        return '$' + price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
    
    // Function to calculate work items cost based on tiered pricing
    function calculateWorkItemCost(count) {
        let remainingItems = count;
        let totalCost = 0;
        
        for (let tier of WORK_ITEM_TIERS) {
            if (remainingItems <= 0) break;
            
            let itemsInTier;
            if (tier.max === Infinity) {
                itemsInTier = remainingItems;
            } else {
                const tierSize = tier === WORK_ITEM_TIERS[0] ? tier.max : (tier.max - WORK_ITEM_TIERS[WORK_ITEM_TIERS.indexOf(tier) - 1].max);
                itemsInTier = Math.min(remainingItems, tierSize);
            }
            
            totalCost += itemsInTier * tier.cost;
            remainingItems -= itemsInTier;
        }
        
        return totalCost;
    }
    
    // Function to calculate total price
    function calculatePrice() {
        // Get input values
        const workItems = parseInt(workItemsInput.value) || 0;
        const gitRepos = parseInt(gitReposInput.value) || 0;
        const buildPipelines = parseInt(buildPipelinesInput.value) || 0;
        const releasePipelines = parseInt(releasePipelinesInput.value) || 0;
        const testPlans = parseInt(testPlansInput.value) || 0;
        const testSuites = parseInt(testSuitesInput.value) || 0;
        const testCases = parseInt(testCasesInput.value) || 0;
        
        // Calculate costs
        const workItemsCost = calculateWorkItemCost(workItems);
        const gitReposCost = gitRepos * GIT_REPO_COST;
        const buildPipelinesCost = buildPipelines * BUILD_PIPELINE_COST;
        const releasePipelinesCost = releasePipelines * RELEASE_PIPELINE_COST;
        
        // Calculate test items as work items (following the same tiered pricing)
        const totalTestItems = testPlans + testSuites + testCases;
        const testItemsCost = calculateWorkItemCost(totalTestItems);
        
        // Calculate total cost
        const totalCost = BASE_COST + workItemsCost + gitReposCost + 
                        buildPipelinesCost + releasePipelinesCost + testItemsCost;
        
        // Update result elements
        baseCostEl.textContent = formatPrice(BASE_COST);
        workItemsCostEl.textContent = formatPrice(workItemsCost);
        gitReposCostEl.textContent = formatPrice(gitReposCost);
        buildPipelinesCostEl.textContent = formatPrice(buildPipelinesCost);
        releasePipelinesCostEl.textContent = formatPrice(releasePipelinesCost);
        testItemsCostEl.textContent = formatPrice(testItemsCost);
        totalCostEl.textContent = formatPrice(totalCost);
        
        // Show the results section
        document.getElementById('results').style.display = 'block';
    }    // Function to process the uploaded Excel file
    function processExcelFile() {
        const fileInput = document.getElementById('excelFile');
        const file = fileInput.files[0];
        
        if (!file) {
            uploadStatus.textContent = 'Please select an Excel file first.';
            uploadStatus.style.color = '#e74c3c';
            return;
        }
        
        uploadStatus.textContent = 'Processing file...';
        uploadStatus.style.color = '#3498db';
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Assume first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Extract data from specific cells based on our mapping
                const extractedData = {};
                
                // Loop through our mapping and extract values
                for (const [fieldName, cellRef] of Object.entries(EXCEL_MAPPING)) {
                    const cellAddress = cellRef.col + cellRef.row;
                    const cell = worksheet[cellAddress];
                    
                    // Check if cell exists and has a value
                    if (cell && cell.v !== undefined) {
                        // Convert to number and ensure it's not negative
                        const value = typeof cell.v === 'number' ? 
                            Math.max(0, Math.floor(cell.v)) : 
                            (parseInt(cell.v) || 0);
                        
                        extractedData[fieldName] = value;
                    } else {
                        extractedData[fieldName] = 0;
                    }
                }
                
                // Update form fields with extracted values
                workItemsInput.value = extractedData.workItems;
                gitReposInput.value = extractedData.gitRepos;
                buildPipelinesInput.value = extractedData.buildPipelines;
                releasePipelinesInput.value = extractedData.releasePipelines;
                testPlansInput.value = extractedData.testPlans;
                testSuitesInput.value = extractedData.testSuites;
                testCasesInput.value = extractedData.testCases;
                
                // Calculate the price with the new values
                calculatePrice();
                
                uploadStatus.textContent = 'File processed successfully!';
                uploadStatus.style.color = '#27ae60';
            } catch (error) {
                console.error('Error processing Excel file:', error);
                uploadStatus.textContent = 'Error processing file. Please check the format.';
                uploadStatus.style.color = '#e74c3c';
            }
        };
        
        reader.onerror = function() {
            uploadStatus.textContent = 'Error reading file.';
            uploadStatus.style.color = '#e74c3c';
        };
        
        reader.readAsArrayBuffer(file);
    }
    
    // Function to export data to Excel
    function exportToExcel() {
        // Get input values
        const workItems = parseInt(workItemsInput.value) || 0;
        const gitRepos = parseInt(gitReposInput.value) || 0;
        const buildPipelines = parseInt(buildPipelinesInput.value) || 0;
        const releasePipelines = parseInt(releasePipelinesInput.value) || 0;
        const testPlans = parseInt(testPlansInput.value) || 0;
        const testSuites = parseInt(testSuitesInput.value) || 0;
        const testCases = parseInt(testCasesInput.value) || 0;
        
        // Calculate costs
        const workItemsCost = calculateWorkItemCost(workItems);
        const gitReposCost = gitRepos * GIT_REPO_COST;
        const buildPipelinesCost = buildPipelines * BUILD_PIPELINE_COST;
        const releasePipelinesCost = releasePipelines * RELEASE_PIPELINE_COST;
        
        // Calculate test items as work items
        const totalTestItems = testPlans + testSuites + testCases;
        const testItemsCost = calculateWorkItemCost(totalTestItems);
        
        // Calculate total cost
        const totalCost = BASE_COST + workItemsCost + gitReposCost + 
                        buildPipelinesCost + releasePipelinesCost + testItemsCost;
        
        // Create worksheet data
        const worksheetData = [
            ['Canarys Copy Project Pricing Calculator'],
            [''],
            ['Input Data', 'Count'],
            ['Work Items', workItems],
            ['Git Repositories', gitRepos],
            ['Build Pipelines', buildPipelines],
            ['Release Pipelines', releasePipelines],
            ['Test Plans', testPlans],
            ['Test Suites', testSuites],
            ['Test Cases', testCases],
            [''],
            ['Price Breakdown', 'Cost (USD)'],
            ['Platform Cost', BASE_COST],
            ['Work Items Cost', workItemsCost],
            ['Git Repositories Cost', gitReposCost],
            ['Build Pipelines Cost', buildPipelinesCost],
            ['Release Pipelines Cost', releasePipelinesCost],
            ['Test Items Cost', testItemsCost],
            [''],
            ['Total Cost', totalCost]
        ];
        
        // Create a worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        
        // Set column widths
        const columnWidths = [
            { wch: 25 }, // Column A width
            { wch: 15 }  // Column B width
        ];
        worksheet['!cols'] = columnWidths;
        
        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Price Calculation');
        
        // Generate Excel file
        const excelFileName = 'Canarys_Copy_Project_Calculation_' + new Date().toISOString().split('T')[0] + '.xlsx';
        
        // Write and download
        XLSX.writeFile(workbook, excelFileName);
    }
      // Function to load values from questionnaire
    function loadValuesFromQuestionnaire() {
        // Check if there are values in localStorage
        if (localStorage.getItem('workItems') !== null) {
            // Load values from localStorage
            workItemsInput.value = localStorage.getItem('workItems');
            gitReposInput.value = localStorage.getItem('gitRepos');
            buildPipelinesInput.value = localStorage.getItem('buildPipelines');
            releasePipelinesInput.value = localStorage.getItem('releasePipelines');
            testPlansInput.value = localStorage.getItem('testPlans');
            testSuitesInput.value = localStorage.getItem('testSuites');
            testCasesInput.value = localStorage.getItem('testCases');
            
            // Calculate the price with the loaded values
            calculatePrice();
            
            // Clear localStorage after loading values
            localStorage.removeItem('workItems');
            localStorage.removeItem('gitRepos');
            localStorage.removeItem('buildPipelines');
            localStorage.removeItem('releasePipelines');
            localStorage.removeItem('testPlans');
            localStorage.removeItem('testSuites');
            localStorage.removeItem('testCases');
            
            // Show a message that values were loaded from the questionnaire
            uploadStatus.textContent = 'Values loaded from questionnaire!';
            uploadStatus.style.color = '#27ae60';
            setTimeout(() => {
                uploadStatus.textContent = '';
            }, 5000);
        }
    }
    
    // Calculate initial price
    calculatePrice();
    
    // Check for values from questionnaire
    loadValuesFromQuestionnaire();
});
