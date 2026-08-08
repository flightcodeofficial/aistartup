export async function downloadPDF(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`PDF 캡처 대상(#${elementId})을 찾을 수 없습니다.`);

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const bgColor =
    getComputedStyle(document.documentElement).getPropertyValue("--background").trim() || "#ffffff";

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: bgColor,
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const pageHeight = 297;
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}
