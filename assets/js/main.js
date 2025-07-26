import '../vendor/jquery/jquery.min.js'
import '../vendor/bootstrap/js/bootstrap.bundle.min.js'
import '../vendor/select2/js/select2.full.min.js'
import '../vendor/pace-progress/pace.min.js'
import '../vendor/summernote/summernote.min.js'
import '../vendor/adminlte/adminlte.min.js'
import Fetch from "./fetch.js"
import {
    datatable, displayPreviewImage, apiInput, updatetableDataStatus,
    Form, Notify, previewImageInput, openDangerModal, setupSelect2
} from "./variable.js";
const selector = document.querySelector;

datatable && initializeTabulator()
$('.summernote').length && $('.summernote').summernote({ height: 300 })
$('.select2').length && $('.select2').select2({})
previewImageInput && (
    previewImageInput.onchange = (e) => displayPreviewImage(e) // display image preview
)

Form && (
    Form.onsubmit = async (e) => {
        try {
            e.preventDefault()
            let res;
            submitFormBtn.disabled = true;
            submitFormBtn.innerHTML = 'Submitting...';

            const formdata = new FormData(e.target)

            Form.id === 'SubmitForm' // Handle Data Submission To Server
                ? res = await Fetch.post(apiInput.value.trim(), formdata)
                : res = await Fetch.put(`${apiInput.value.trim()}/${e.target.dataset?.id}`, formdata)

            Notify(res) // Notify Server Message
            if (res.success && res.redirect) setTimeout(() => { window.location.href = res.redirect }, 800)
        } catch (error) {
            console.error(error)
        } finally {
            submitFormBtn.disabled = false;
            submitFormBtn.innerHTML = 'Submit';
        }
    }
)

datatable && (
    datatable.onclick = (e) => { // Handle Datatable Actions
        const endApi = `${apiInput.value.trim()}/${e.target.dataset.id}`;

        if (e.target.closest('.danger-modal')) openDangerModal(endApi)
        if (e.target.closest('.status')) updatetableDataStatus(e.target.checked, endApi)
        if (e.target.closest('.edit')) getTableRowData(endApi)
    }
)

// setupSelect2('#select', '/admin/resources/select/api/admin', 'Search Admin')
let counter = 0;
const btn = document.querySelector('#addFieldBtn')
btn && (document.querySelector('#addFieldBtn').onclick = () => {
    const schematypesArray = ["String", "Number", "Boolean", 'Code', 'Integer', "Array", 'ObjectId', "Object", "Date", 'Int32', 'Int64', 'Double128', 'Double', 'BSONRegExp', 'Null', 'Binary Data']
    const formInputTypeArray = ['text', 'select', 'file', 'email', 'url', 'tel', 'search', 'number', 'range', 'color', 'date', 'time', 'datetime-local', 'month', 'week', 'radio', 'checkbox', 'textarea']
    const field = Math.round(Math.random() * 10) * 4;
    const field_type = Math.round(Math.random() * 10) * 5;
    const form_type = Math.round(Math.random() * 10) * 6;
    const originalTemplate = `<div class="row mb-3">
                                <div class="col-md-3">
                                    <label for="${field}" class="form-label">Field</label>
                                    <input type="text" class="form-control" name="field[${counter}][field_name]"
                                        placeholder="eg: name, email, password" id="${field}">
                                </div>
                                <div class="col-md-4">
                                    <label for="${field_type}" class="form-label">Type</label>
                                    <Select name="field[${counter}][field_type]" class="form-control" id="${field_type}">
                                        ${schematypesArray.map(type => `<option value="${type}">${type}</option>`).join('')}
                                    </Select>
                                </div>
                                <div class="col-md-4">
                                    <label for="${form_type}" class="form-label">Edit in place</label>
                                    <Select name="field[${counter}][form_type]" class="form-control" id="${form_type}">
                                        ${formInputTypeArray.map(type => `<option value="${type}">${type}</option>`).join('')}
                                    </Select>
                                </div>
                                <div class="col-md-1 align-content-end">
                                    <button type="button" class="deleteField btn btn-danger bg-danger btn-close"></button>
                                </div>
                            </div>`;
    document.querySelector('#addField').insertAdjacentHTML('afterbegin', originalTemplate)
    counter++
})

// document.querySelector('.deleteField') && (
//     document.querySelector('.deleteField').onclick = (e) => {
//         console.log(e.target.closest('.row').remove());

//         return e.target.closest('.row').remove()
//     }
// )