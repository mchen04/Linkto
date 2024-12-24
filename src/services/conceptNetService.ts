const CONCEPTNET_API = 'http://api.conceptnet.io';

export async function findConceptualRelationship(word1: string, word2: string) {
  try {
    // Query ConceptNet for relationships between words
    const response = await fetch(
      `${CONCEPTNET_API}/relatedness?node1=/c/en/${word1}&node2=/c/en/${word2}`
    );
    const data = await response.json();
    
    if (data.value >= 0.5) { // Threshold for relationship strength
      // Get the specific relationship type
      const edgeResponse = await fetch(
        `${CONCEPTNET_API}/query?node=/c/en/${word1}&other=/c/en/${word2}`
      );
      const edgeData = await edgeResponse.json();
      
      return {
        type: edgeData.edges[0]?.rel?.label || 'Conceptual',
        strength: data.value,
        isValid: true,
      };
    }
    
    return null;
  } catch (error) {
    console.error('ConceptNet API error:', error);
    return null;
  }
} 