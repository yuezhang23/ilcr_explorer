import * as dao from "./dao.js";

export default function ClaimRoutes(app) {

  const createClaim = async (req, res) => {
    try {
      const claim = await dao.createClaim(req.body);
      res.json(claim);
    } catch (error) {
      res.status(400).send("Name is required.");
    }
  };
  app.post("/api/claims", createClaim);

  const deleteClaim = async (req, res) => {
    try {
      const status = await dao.deleteClaim(req.params.claimId);
      res.json(status);
    } catch (error) {
      res.status(400).send("Not able to delete");
    }
  };
  app.delete("/api/claims/:claimId", deleteClaim);

  const updateClaim = async (req, res) => {
    const { claimId } = req.params;
    const newClaim = req.body
    try {
      if(!newClaim.legalName) {
        throw new Error("Legal Name is required.");
      }
      const status = await dao.updateClaim(claimId, req.body);
      res.json(status);
    } catch (error) {
      res.status(400).json({ message: error.message });
    } 
  };
  app.put("/api/claims/:claimId", updateClaim);

  const findAllClaims = async (req, res) => {
    try {
      const { completion } = req.query;
      if (completion !== undefined) {
        const completedBool = completion === "true";
        const claims = await dao.findClaimsByCompletion(completedBool);
        res.json(claims);
        return;
      }
      const claims = await dao.findAllClaims();
      res.json(claims);
    } catch (err) {
      res.status(400).json(
        { message: err.message });
    }
  };
  app.get("/api/claims", findAllClaims);

  const findClaimById = async (req, res) => {
    try {
      const { claimId } = req.params
      const claim = await dao.findClaimById(claimId);
      if (!claim) {
        throw new Error("No claim with this ID")
      }
      res.json(claim);
    } catch (error) {
      res.status(400).json(
        { message: error.message });
    }
  };
  app.get("/api/claims/:claimId", findClaimById);

  const findUserClaims = async (req, res) => {
    try {
      const { userId } = req.params;
      const claims = await dao.findUserClaims(userId);
      res.json(claims);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  app.get("/api/users/:userId/claims", findUserClaims);

  const findPendingClaim = async (req, res) => {
    try {
      const { userId } = req.params;
      const claims = await dao.findPendingClaims(userId);
      res.json(claims);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  app.get("/api/users/:userId/claims/pending", findPendingClaim);
}


const findClaimByBrewId = async (req, res) => {
  try {
    const { bid } = req.params
    console.log(bid)
    const claim = await dao.findClaimByBrewId(bid);
    if (!claim) {
      res.send({})
    }
    res.json(claim);
  } catch (error) {
    res.status(400).json(
      { message: error.message });
  }
  app.get("/api/users/match/:bid/claims", findClaimByBrewId);
};

