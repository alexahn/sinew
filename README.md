# sinew

Sinew is a universal router that uses the URL as the source of state. Sinew allows the formulation of a state vocabulary by partioning the URL (e.g. by grouping path parameters or query string parameters) into exclusive subgroups (or sub-states). Sinew includes a way to resolve dependencies per state such that the dependencies are available for all sub-states of a state. Sinew also decouples the definition of the states from when they are acted on through the pathfinder and director concepts.
