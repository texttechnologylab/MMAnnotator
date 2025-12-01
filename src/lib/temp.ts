export function getCorpusConfig(title: string): string {
  return JSON.stringify({
    name: title,
    author: "CORE Project",
    language: "de-DE",
    description: "Antworten der Probanden auf die vier Medizin-Aufgaben in T0.",
    addToExistingCorpus: true,
    annotations: {
      uceMetadata: true,
      annotatorMetadata: true,
      OCRPage: true,
      OCRParagraph: true,
      OCRBlock: false,
      OCRLine: false,
      srLink: false,
      lemma: true,
      namedEntity: true,
      sentence: true,
      taxon: {
        annotated: false,
        biofidOnthologyAnnotated: false
      },
      time: false,
      wikipediaLink: false,
      cohmetrix: true,
      image: true
    },
    other: {
      availableOnFrankfurtUniversityCollection: false,
      includeKeywordDistribution: false,
      enableEmbeddings: true,
      enableRAGBot: true
    }
  })
}
