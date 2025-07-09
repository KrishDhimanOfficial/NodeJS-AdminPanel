export const previewImageInput = document.querySelector('#photo')
export const apiInput = document.querySelector('#apiInput')
export const Form = document.querySelector('#SubmitForm') || document.querySelector('#updateForm')
export const submitFormBtn = document.querySelector('#submitFormBtn')
export const datatable = document.querySelector('#tabulator')
import Fetch from "./fetch.js"

const notyf = new Notyf({
    duration: 1000,
    position: { x: 'right', y: 'bottom' },
    types: [
        { type: 'warning', background: 'orange', duration: 2000 },
        { type: 'info', background: 'lightblue', duration: 2000 }
    ]
}) // Set Notifications For Server Response

export const displayPreviewImage = async (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = () => previewImage.src = reader.result;
    reader.readAsDataURL(file)
}

export const Notify = (data) => {
    if (data.success) notyf.success(data.success)
    if (data.warning) notyf.open({ type: 'warning', message: data.warning })
    if (data.info) notyf.open({ type: 'info', message: data.info })
    if (data.error) notyf.error(data.error)
    if (data.errors) data.errors.forEach(error => notyf.error(error))
    return;
}

export const openDangerModal = (api) => { // Handle Open Delete Modal
    modalconfirmdeleteBtn.onclick = () => handleDeleteRequest(api)
}

const handleDeleteRequest = async (api) => {
    const res = await Fetch.delete(api)
    Notify(res)
    if (res.success) setTimeout(() => window.location.reload(), 1000)
}