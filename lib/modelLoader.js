import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * @param {Object} config
 * @param {Array} config.resources - List of resource objects with { model, options, aggregate, multer }
 * @returns {Object} loadedModels - keyed by model name
*/

const create = `<div class="container">
    <div class="row">
        <div class="col-12">
            <div class="card card-primary">
                <div class="card-header bg-purple">
                    <h3 class="card-title">Add Information</h3>
                </div>
                <form id="SubmitForm" enctype="application/x-www-form-urlencoded">
                    <div class="card-body">
                    </div>
                    <div class="modal-footer justify-content-between">
                        <button id="submitFormBtn" class="btn btn-primary">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>`;

const update = `<div class="container">
    <div class="row">
        <div class="col-12">
            <div class="card card-primary">
                <div class="card-header bg-purple">
                    <h3 class="card-title">View Information</h3>
                </div>
            </div>
        </div>
    </div>
</div>`

const view = `<div class="container">
    <div class="row">
        <div class="col-12">
            <div class="card card-primary">
                <div class="card-header bg-purple">
                    <h3 class="card-title">View Information</h3>
                </div>
            </div>
        </div>
    </div>
</div>`

export const loadModels = async ({ resources = [] }) => {
    let loadedModels = []

    for (const resource of resources) {
        const { model, options = {}, aggregate, multer, select2 } = resource;
        const modelName = model.modelName;

        const viewDir = path.join(__dirname, '../views', modelName)
        loadedModels.push({
            modelName,
            model,
            options,
            aggregate,
            multer,
            select2
        })

        // Ensure views directory exists
        try {
            await fs.mkdir(viewDir, { recursive: true })

            const viewTemplates = { create, update, view }

            for (const [viewName, content] of Object.entries(viewTemplates)) {
                const filePath = path.join(viewDir, `${viewName}.ejs`)
                try {
                    await fs.access(filePath)
                } catch {
                    await fs.writeFile(filePath, content)
                }
            }
        } catch (err) {
            console.error(`❌ View setup failed for ${modelName}: ${err.message}`);
        }
    }

    return loadedModels
}