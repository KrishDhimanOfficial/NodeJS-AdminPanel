import fs from "fs/promises"
import * as recast from "recast"
import { parse } from "@babel/parser"
import * as t from "@babel/types"

const PARSER = {
    parse: (code) =>
        parse(code, {
            sourceType: "module",
            plugins: [
                "jsx",
                "classProperties",
                "decorators-legacy",
                "importAssertions",
                "topLevelAwait",
                "typescript", // harmless if unused; helps if file has TS hints
            ],
        }),
}
const b = t;

/** helpers */
const isValidIdentifier = (name) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)
const keyFrom = (name) =>
    isValidIdentifier(name) ? b.identifier(name) : b.stringLiteral(name)

const memberFrom = (dotted) =>
    dotted.split(".").reduce((acc, part, i) => {
        const id = b.identifier(part)
        return i === 0 ? id : b.memberExpression(acc, id)
    }, null)

const buildTypeAST = (fieldType) => {
    switch (fieldType) {
        case "ObjectId":
            return memberFrom("mongoose.Schema.Types.ObjectId")
        case "Mixed":
            return memberFrom("mongoose.Schema.Types.Mixed")
        case "Array":
            return memberFrom("[]")
        case "Map":
            return memberFrom("{}")
        case "Date":
            return b.identifier("Date")
        default:
            // String, Number, Boolean, Array, Map, Buffer, Decimal128, etc.
            return b.identifier(fieldType)
    }
}

const prop = (k, v) => b.objectProperty(b.identifier(k), v)

/** Build the field object expression using your metadata rules */
const buildFieldValue = (f) => {
    const props = []

    props.push(prop("type", buildTypeAST(f.field_type)))

    if (f.required === "on") {
        props.push(
            prop(
                "required",
                b.arrayExpression([
                    b.booleanLiteral(true),
                    b.stringLiteral(`${f.field_name} is required.`),
                ])
            )
        )
    }

    if (f.unique === "on") {
        props.push(
            prop(
                "unique",
                b.arrayExpression([
                    b.booleanLiteral(true),
                    b.stringLiteral(`${f.field_name} is already in use.`),
                ])
            )
        )
    }

    if (f.relation && f.relation !== "No Relation") {
        props.push(prop("ref", b.stringLiteral(f.relation)))
    }

    if (f.defaultValue && f.field_type === 'Number' && f.form_type === 'number') {
        props.push(
            prop(
                "default",
                b.numericLiteral(parseInt(f.defaultValue))
            )
        )
    }

    if (f.defaultValue && f.field_type === 'String' && f.form_type === 'text') {
        props.push(
            prop(
                "default",
                b.stringLiteral(f.defaultValue)
            )
        )
    }

    return b.objectExpression(props)
}


const printNode = (node) => recast.print(node).code.replace(/\s+/g, " ").trim()

/** Compare & update only known keys: type/required/unique/ref */
const upsertField = (fieldsObjExpr, fieldName, newVal, f) => {
    const existingProp = fieldsObjExpr.properties.find(
        (p) =>
            t.isObjectProperty(p) &&
            ((t.isIdentifier(p.key) && p.key.name === fieldName) ||
                (t.isStringLiteral(p.key) && p.key.value === fieldName))
    )

    if (!existingProp) {
        fieldsObjExpr.properties.push(
            b.objectProperty(keyFrom(fieldName), newVal)
        )
        return { action: "added" }
    }

    if (!t.isObjectExpression(existingProp.value)) {
        existingProp.value = b.objectExpression([prop("type", existingProp.value)])
    }

    const target = existingProp.value;

    // Remove required/unique if not "on"
    if (f?.required !== "on") {
        target.properties = target.properties.filter(
            (p) => !(t.isObjectProperty(p) && p.key.name === "required")
        )
    }
    if (f?.unique !== "on") {
        target.properties = target.properties.filter(
            (p) => !(t.isObjectProperty(p) && p.key.name === "unique")
        )
    }

    if (f?.defaultValue === '') {
        target.properties = target.properties.filter(
            (p) => !(t.isObjectProperty(p) && p.key.name === "default")
        )
    }

    // inside upsertField, before replacing 'type'
    newVal.properties.forEach((newProp) => {
        const idx = target.properties.findIndex(
            (p) => t.isObjectProperty(p) && p.key.name === newProp.key.name
        );

        // Special case: Array type should not overwrite custom array contents
        if (
            f.field_type === "Array" &&
            newProp.key.name === "type" &&
            idx !== -1
        ) {
            const existingTypeVal = target.properties[idx].value;
            // If existing is an ArrayExpression with elements → keep it
            if (t.isArrayExpression(existingTypeVal) && existingTypeVal.elements.length > 0) {
                return; // skip updating
            }
        }

        // Special case: Map type should not overwrite custom object contents
        if (
            f.field_type === "Map" &&
            newProp.key.name === "type" &&
            idx !== -1
        ) {
            const existingTypeVal = target.properties[idx].value;
            if (t.isObjectExpression(existingTypeVal) && existingTypeVal.properties.length > 0) {
                return; // skip updating
            }
        }

        if (idx === -1) {
            target.properties.push(newProp);
        } else {
            target.properties[idx].value = newProp.value;
        }
    });


    return { action: 'updated' }
}

const ensureImport = (ast, source, defaultName) => {
    const body = ast.program.body;
    const has = body.some(
        (n) =>
            t.isImportDeclaration(n) &&
            n.source.value === source &&
            n.specifiers.some((s) => t.isImportDefaultSpecifier(s))
    )
    if (!has) {
        body.unshift(
            b.importDeclaration(
                [b.importDefaultSpecifier(b.identifier(defaultName))],
                b.stringLiteral(source)
            )
        )
    }
}

const ensurePluginImport = (ast) => {
    const body = ast.program.body;
    const has = body.some(
        (n) =>
            t.isImportDeclaration(n) &&
            n.source.value === "mongoose-aggregate-paginate-v2"
    )
    if (!has) {
        body.unshift(
            b.importDeclaration(
                [b.importDefaultSpecifier(b.identifier("mongooseAggregatePaginate"))],
                b.stringLiteral("mongoose-aggregate-paginate-v2")
            )
        )
    }
}

const findSchemaBinding = (ast, collection) => {
    const name = `${collection}Schema`;
    let schemaInitPath = null;

    recast.types.visit(ast, {
        visitVariableDeclarator(path) {
            const { node } = path;
            if (t.isIdentifier(node.id, { name }) && t.isNewExpression(node.init)) {
                const callee = node.init.callee;
                if (
                    t.isMemberExpression(callee) &&
                    t.isIdentifier(callee.object, { name: "mongoose" }) &&
                    t.isIdentifier(callee.property, { name: "Schema" })
                ) {
                    schemaInitPath = path;
                    return false
                }
            }
            this.traverse(path)
        },
    })
    return schemaInitPath
}

const ensurePluginApplied = (ast, collection) => {
    const schemaName = `${collection}Schema`;
    let hasPlugin = false;
    recast.types.visit(ast, {
        visitCallExpression(path) {
            const { node } = path;
            if (
                t.isMemberExpression(node.callee) &&
                t.isIdentifier(node.callee.object, { name: schemaName }) &&
                t.isIdentifier(node.callee.property, { name: "plugin" }) &&
                node.arguments.length &&
                printNode(node.arguments[0]).includes("mongooseAggregatePaginate")
            ) {
                hasPlugin = true;
                return false;
            }
            this.traverse(path)
        },
    })

    if (!hasPlugin) {
        // insert after the variable declaration that defines <collection>Schema
        const body = ast.program.body;
        const declIndex = body.findIndex(
            (n) =>
                t.isVariableDeclaration(n) &&
                n.declarations.some(
                    (d) => t.isIdentifier(d.id, { name: `${collection}Schema` })
                )
        )
        const pluginStmt = b.expressionStatement(
            b.callExpression(
                b.memberExpression(
                    b.identifier(`${collection}Schema`),
                    b.identifier("plugin")
                ),
                [b.identifier("mongooseAggregatePaginate")]
            )
        )
        if (declIndex >= 0) {
            body.splice(declIndex + 1, 0, pluginStmt)
        } else {
            body.push(pluginStmt)
        }
    }
}

const ensureExportDefaultModel = (ast, collection) => {
    const body = ast.program.body;
    const hasExport = body.some(
        (n) =>
            t.isExportDefaultDeclaration(n) &&
            t.isCallExpression(n.declaration) &&
            t.isMemberExpression(n.declaration.callee) &&
            t.isIdentifier(n.declaration.callee.object, { name: "mongoose" }) &&
            t.isIdentifier(n.declaration.callee.property, { name: "model" }) &&
            n.declaration.arguments.length >= 2 &&
            t.isStringLiteral(n.declaration.arguments[0]) &&
            n.declaration.arguments[0].value === collection &&
            t.isIdentifier(n.declaration.arguments[1], { name: `${collection}Schema` })
    )

    if (!hasExport) {
        body.push(
            b.exportDefaultDeclaration(
                b.callExpression(
                    b.memberExpression(b.identifier("mongoose"), b.identifier("model")),
                    [b.stringLiteral(collection), b.identifier(`${collection}Schema`)]
                )
            )
        )
    }
}


const ensureTimestamps = (schemaNewExpr, on) => {
    if (!t.isNewExpression(schemaNewExpr)) return;
    const args = schemaNewExpr.arguments;
    // ensure args[1] is an object with timestamps
    if (args.length < 2 || !t.isObjectExpression(args[1])) {
        args[1] = b.objectExpression([
            prop("timestamps", b.booleanLiteral(on)),
        ])
        return;
    }
    const opts = args[1]
    const tsProp = opts.properties.find(
        (p) => t.isObjectProperty(p) && t.isIdentifier(p.key, { name: "timestamps" })
    )
    if (tsProp) {
        tsProp.value = b.booleanLiteral(on)
    } else {
        opts.properties.push(prop("timestamps", b.booleanLiteral(on)))
    }
}

const createFreshContent = (collection, fields, timeStamp) => {
    const fieldLines = fields
        .map((f) => {
            const name = f.field_name.replace(/\s+/g, "_").trim()
            const node = buildFieldValue(f)
            return `  ${name}: ${recast.print(node).code}`;
        })
        .join(",\n")

    return `import mongoose from "mongoose";
            import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

            const ${collection}Schema = new mongoose.Schema({
            ${fieldLines}
            }, { timestamps: ${timeStamp === "on"} })

            ${collection}Schema.plugin(mongooseAggregatePaginate)
            export default mongoose.model("${collection}", ${collection}Schema)`;
}

/** ============================== */
/** THE FUNCTION YOU’LL CALL       */
/** ============================== */
export default async function createModelFile(filePath, collection, fields, timeStamp) {
    const normalized = fields.map((f) => ({
        ...f,
        field_name: f.field_name.replace(/\s+/g, "_").trim(),
    }))


    // 1) try to read existing file
    let src = "";
    try {
        src = await fs.readFile(filePath, "utf8")
    } catch {
        // file missing → create fresh
        const fresh = createFreshContent(collection, normalized, timeStamp)
        await fs.writeFile(filePath, fresh, "utf8")
        return;
    }

    // 2) parse and locate the schema object (preserve all other code)
    const ast = recast.parse(src, { parser: PARSER })
    ensureImport(ast, "mongoose", "mongoose")
    ensurePluginImport(ast)

    const schemaDecl = findSchemaBinding(ast, collection)

    // if schema not found, append a fresh one (do not touch manual code)
    if (!schemaDecl) {
        const fresh = "\n\n" + createFreshContent(collection, normalized, timeStamp)
        await fs.writeFile(filePath, src + fresh, "utf8")
        return;
    }

    // 3) ensure timestamps & collect the fields object expression
    const init = schemaDecl.node.init; // NewExpression
    ensureTimestamps(init, timeStamp === "on")

    const fieldsObj =
        t.isNewExpression(init) &&
            init.arguments.length &&
            t.isObjectExpression(init.arguments[0])
            ? init.arguments[0]
            : null;

    if (!fieldsObj) {
        // schema exists but no fields (edge case) — create an object
        init.arguments[0] = b.objectExpression([])
    }

    const targetFieldsObj = init.arguments[0]

    // 4) remove fields not present in the new fields array
    const allowedNames = normalized.map(f => f.field_name)
    targetFieldsObj.properties = targetFieldsObj.properties.filter((p) => {
        if (!t.isObjectProperty(p)) return true; // keep comments/spreads/etc.
        const keyName = t.isIdentifier(p.key) ? p.key.name : p.key.value;
        return allowedNames.includes(keyName)
    })

    // 5) upsert each field (only change owned keys)
    normalized.forEach((f) => {
        const newVal = buildFieldValue(f)
        upsertField(targetFieldsObj, f.field_name, newVal, f)
    })

    // 5) ensure plugin and export lines exist
    ensurePluginApplied(ast, collection)
    ensureExportDefaultModel(ast, collection)

    // 6) write back, preserving manual code/style
    const out = recast.print(ast).code;
    await fs.writeFile(filePath, out, "utf8")
}