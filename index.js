import { getInput, setFailed } from '@actions/core';
import { select } from 'xpath';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { readFileSync, writeFileSync } from 'fs';

try {
    const filePath = getInput('filepath', {required: true});
    const xpathString = getInput('xpath', {required: true});
    const replaceString = getInput('replace');

    const oldContent = readFileSync(filePath, 'utf8');
    const newContent = replace(oldContent, xpathString, replaceString);
    writeFileSync(filePath, newContent);
} catch (error) {
    console.log(error)
    setFailed(error.message);
}

function replace(content, xpathString, replaceString) {
    const document = new DOMParser().parseFromString(content);

    const nodes = select(xpathString, document);
    if (nodes.length === 0) {
        setFailed("No matching xml nodes found");
    } else {
        for (const node of nodes) {
            console.log("Setting xml value at " + getNodePath(node));
            if (replaceString === null) {
                node.parentNode.removeChild(node);
            } else {
                node.textContent = replaceString;
            }
        }
        return new XMLSerializer().serializeToString(document)
    }
}

function getNodePath(node) {
    let parentNode = node.parentNode;
    if (parentNode == null) {
        return node.nodeName;
    }
    return (getNodePath(parentNode)) + "/" + node.nodeName;
}