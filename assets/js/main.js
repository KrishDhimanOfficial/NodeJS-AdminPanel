import '../vendor/jquery/jquery.min.js'
import '../vendor/bootstrap/js/bootstrap.bundle.min.js'
import '../vendor/pace-progress/pace.min.js'
import '../vendor/adminlte/adminlte.min.js'
import Fetch from "./fetch.js"
import {
    datatable, displayPreviewImage, apiInput,
    Form, Notify, previewImageInput, openDangerModal
} from "./variable.js";

datatable && initializeTabulator()
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
            console.log(Form);
            

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