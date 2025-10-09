// import '../vendor/jquery/jquery.min.js'
// import '../vendor/bootstrap/js/bootstrap.bundle.min.js'
// import '../vendor/select2/js/select2.full.min.js'
// import '../vendor/pace-progress/pace.min.js'
// import '../vendor/adminlte/adminlte.min.js'
// import '../vendor/summernote/summernote.min.js'
// import '../vendor/iconpicker/fontawesome-iconpicker.min.js'
import Fetch from "./Fetch.js"
import {
  datatable, displayPreviewImage, updatetableDataStatus,
  Form, Notify, previewImageInput, openDangerModal, setupSelect2, deleteCRUDFieldRow,
  FieldCheckBox, setFieldDefaultValue, FieldRow, getDragAfterElement, rearrangeFieldGroup
} from "./variable.js";

datatable && initializeTabulator()
$('.iconpicker').length && $('.iconpicker').iconpicker({
  fullClassFormatter: function (val) { return 'fa ' + val }
})
$('.summernote').length && $('.summernote').summernote({ placeholder: 'Start typing...', height: 300 })
$('.select2').length && $('.select2').select2()

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

      const FieldGroups = document.querySelectorAll('#addField .field-group')
      FieldGroups && rearrangeFieldGroup(FieldGroups) // Reorder Field Groups

      const formdata = new FormData(e.target)
      document.querySelector('.summernote') && formdata.delete('files')


      Form.id === 'SubmitForm' // Handle Data Submission To Server
        ? res = await Fetch.post(apiInput.value.trim(), formdata)
        : res = await Fetch.put(`${apiInput.value.trim()}/${e.target.dataset?.id}`, formdata)

      Notify(res) // Notify Server Message
      if (res.success && res.redirect) setTimeout(() => { window.location.href = res.redirect }, res.delay || 800)
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

// Handle Select2 functionality
document.querySelectorAll('select[id]').forEach((select) => {
  const id = select.id;
  if (select.dataset.selectbox === 'true') {
    const selector = `#${id}`;
    const url = `/admin/resources/select/api/${id}`;
    setupSelect2(selector, url, `Search ${id}`)
  }
})

// handle overwrite DataTable API checkBox
const overwrite_dataTableApi_checkBox = document.querySelector('#overwrite_dataTableApi_checkBox')

const dataTableApi = document.querySelector('#dataTableApi')
overwrite_dataTableApi_checkBox?.addEventListener('change', () => dataTableApi.classList.toggle('d-none'))

let counter = parseInt(document.querySelector('#counter')?.value) || 0;
let collections = null;

const addFieldBtn = document.querySelector('#addFieldBtn');
const fieldsContainer = document.querySelector('#addField');

// Fetch collections asynchronously and store them
(async () => {
  collections = await Fetch.get('/admin/collections');
})();

// Delete field row logic (assumed to be defined elsewhere)
deleteCRUDFieldRow('#addField')

// Handle Add Field button click
addFieldBtn?.addEventListener('click', () => {
  const filters = ['search', 'boolean', 'groupValueFilter', 'date', 'minmax', 'number'];

  // Dynamic IDs based on counter
  const fieldId = `field_${counter}`;
  const typeId = `type_${counter}`;
  const formTypeId = `form_type_${counter}`;
  const collectionId = `relation_collection_${counter}`;
  const searchFilterId = `search_filter_${counter}`;
  const displayNameId = `display_name_${counter}`;

  // Template for new field block
  const fieldTemplate = `
    <div id="field_group_${counter + 1}" class="field-group-${counter + 1}" >
      <h3>Field ${counter + 1}</h3>
      ${FieldRow(fieldId, formTypeId, typeId, counter)}
      <div id="selectBox_form_type_${counter}" class="row mb-2 d-none"></div>

      <div class="row mb-2">
        <div class="col-md-3">
          ${FieldCheckBox(counter)}
        </div>

        <div class="col-md-4">
          <label for="${searchFilterId}" class="form-label">Search Filter</label>
          <select name="field[${counter}][searchFilter]" class="select2 form-control" id="${searchFilterId}">
            <option disabled selected>Select Search Filter</option>
            ${filters.map(name => `<option value="${name}">${name}</option>`).join('')}
          </select>
        </div>

        <div class="col-md-4">
          <label for="${collectionId}" class="form-label">Field Relation</label>
          <select name="field[${counter}][relation]" class="select2 form-control" id="${collectionId}">
            <option selected>No Relation</option>
            ${collections.map(name => `<option value="${name}">${name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div id="defaultValueRow_${counter}" class="row mb-2 d-none"></div>

      <div id="displayNameRow_${counter}" class="row mb-2 d-none">
          <div class="col-md-3">
            <label for="${displayNameId}" class="form-label">Display Name</label>
            <input type="text" class="form-control" name="field[${counter}][display_name]"
                placeholder="eg: Author ,Publisher" id="${displayNameId}">
          </div>
      </div>

      <hr style="border-top:1px solid rgba(0,0,0,0.4);">
    </div>`;

  // Append to DOM
  fieldsContainer.insertAdjacentHTML('beforeend', fieldTemplate)

  // Reinitialize select2 for dynamic elements
  $('.select2').select2()
  counter++;
})

// Listen for select[type] changes dynamically
$(document).on('change', 'select[data-counter]', function () {
  const counter = $(this).data('counter')
  const selectedValue = $(this).val()
  const imageSettingsEl = document.querySelector(`#selectBox_form_type_${counter}`)

  const templates = {
    file: `
      <div class="col-md-5 offset-md-6">
        <div class="d-flex gap-2 justify-content-center">
          <div class="form-floating mb-3">
            <input type="number" class="form-control" name="field[${counter}][file][length]" min="0" id="formId${counter}_length" />
            <label for="formId${counter}_length">Length</label>
          </div>
          <div class="form-floating mb-3">
            <input type="number" class="form-control" name="field[${counter}][file][size]" id="formId${counter}_size" min="0" />
            <label for="formId${counter}_size">Size (eg: 2 * 1024 = 2KB)</label>
          </div>
        </div>
      </div>`,
    select: `
      <div class="col-md-5 offset-md-6">
          <div class="form-floating mb-3">
            <input type="text" class="form-control" name="field[${counter}][display_key]" id="formId${counter}_display" placeholder="eg: category,author -> name,title" />
            <label for="formId${counter}_display">Display_key</label>
          </div>
      </div>`,
    checkbox: `<div class="col-md-5 offset-md-6">
              <div class="form-floating mb-3">
                <input type="text" class="form-control" name="field[${counter}][checkbox_option]" id="formId${counter}_checkbox_option" />
                <label for="formId${counter}_checkbox_option">Add Options (eg: option1,option2,option3)</label>
              </div>
            </div>`,
    radio: `<div class="col-md-5 offset-md-6">
              <div class="form-floating mb-3">
                <input type="text" class="form-control" name="field[${counter}][check_options]" id="formId${counter}_check_options"  />
                <label for="formId${counter}_check_options">Add Options (eg: option1,option2,option3)</label>
              </div>
            </div>`
  }

  // Toggle visibility and insert template
  if (templates[selectedValue]) {
    imageSettingsEl.classList.remove('d-none')
    imageSettingsEl.innerHTML = templates[selectedValue]
  } else {
    imageSettingsEl.classList.add('d-none')
    imageSettingsEl.innerHTML = '';
  }
})

// Toggle default value row and attach onchange to type select
fieldsContainer && (
  fieldsContainer.onclick = (e) => {
    const counter = e.target.dataset.counter;
    if (!counter) return;

    const default_value_checkBox = e.target.closest(`#default_value_checkBox_${counter}`)
    const display_name_checkBox = e.target.closest(`#display_name_checkBox_${counter}`)
    const typeSelect = document.querySelector(`#type_${counter}`)
    const defaultRow = document.querySelector(`#defaultValueRow_${counter}`)
    const displayNameRow = document.querySelector(`#displayNameRow_${counter}`)

    if (default_value_checkBox) {
      defaultRow.classList.toggle('d-none')
      setFieldDefaultValue(counter, defaultRow, typeSelect?.value)
    }

    // Attach onchange to type selector
    if (typeSelect && default_value_checkBox) {
      typeSelect.onchange = (e) => {
        e.target.value != 'String' && e.target.value != 'Number'
          ? default_value_checkBox.checked = false
          : default_value_checkBox.checked = true, defaultRow.classList.toggle('d-none')
        setFieldDefaultValue(counter, defaultRow, e.target.value)
      }
    }

    if (display_name_checkBox) {
      displayNameRow.classList.toggle('d-none')
    }
  }
)

// Submenu checkbox toggle
const subMenuCheck = document.querySelector('#isSubMenu')
subMenuCheck?.addEventListener('change', () => {
  document.querySelector('#subMenusettings')?.classList.toggle('d-none')
  document.querySelector('#mainIcon')?.classList.toggle('d-none')
})

const prevent_deletion = document.querySelector('#prevent_deletion')
prevent_deletion?.addEventListener('change', () => {
  document.querySelector('#preventDeletionRow')?.classList.toggle('d-none')
})

// drag & drop functionality Field Row Groups
let draggedItem = null; 
fieldsContainer && (
  fieldsContainer.addEventListener("dragstart", (e) => {
    draggedItem = e.target;
    setTimeout(() => (e.target.style.display = "none"), 0)
  }),

  fieldsContainer.addEventListener("dragend", (e) => {
    setTimeout(() => {
      draggedItem.style.display = "block";
      draggedItem = null;
    }, 0)
  }),

  fieldsContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(fieldsContainer, e.clientY)
    if (afterElement == null) {
      fieldsContainer.appendChild(draggedItem)
    } else {
      fieldsContainer.insertBefore(draggedItem, afterElement)
    }
  })
)