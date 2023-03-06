export function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

export function downloadToFile(content, filename, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });

    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();

    URL.revokeObjectURL(a.href);
};

export function saveText(filename, content) {
    downloadToFile(content, filename, 'text/plain');
}
