
export function copyToClipboard(text: string): boolean {
  const aux = document.createElement('input')

  aux.setAttribute('value', text)
  aux.contentEditable = 'true'
  aux.readOnly = true

  document.body.appendChild(aux)

  if (navigator.userAgent.match(/iphone|ipad|ipod/i)) {
    const range = document.createRange()
    range.selectNodeContents(aux)

    const sel = getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
    aux.setSelectionRange(0, text.length)
  } else {
    aux.select()
  }

  const result = document.execCommand('copy')
  document.body.removeChild(aux)

  return result
}
